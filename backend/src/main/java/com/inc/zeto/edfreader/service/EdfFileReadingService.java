package com.inc.zeto.edfreader.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import com.inc.zeto.edfreader.api.model.EdfChannel;
import com.inc.zeto.edfreader.api.model.EdfChannelSignal;
import com.inc.zeto.edfreader.api.model.EdfFileContent;
import com.inc.zeto.edfreader.api.model.EdfFileStatus;
import com.inc.zeto.edfreader.api.model.EdfFileSummary;
import com.inc.zeto.edfreader.edflib.EDFException;
import com.inc.zeto.edfreader.edflib.EDFreader;
import com.inc.zeto.edfreader.properties.EdfFileProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static com.inc.zeto.edfreader.util.RawEdfHeaderInspector.isHeaderInconsistent;

@Service
@Slf4j
@RequiredArgsConstructor
public class EdfFileReadingService {

    private final EdfFileProperties edfFileProperties;

    public List<EdfFileSummary> getAllFiles() {
        try (Stream<Path> stream = Files.list(Path.of(edfFileProperties.getFolderPath()))) {
            return stream
                .filter(p -> p.toString().toLowerCase().endsWith(".edf"))
                .filter(Files::isRegularFile)
                .map(this::toEdfFileSummary)
                .toList();
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot read EDF directory", e);
        }
    }

    public EdfFileContent getFileByName(String name) {
        Path file = getExistingFilePath(name);
        EDFreader reader = null;
        try {
            reader = new EDFreader(file.toString());
            return fileToEdfFileContentMapper(file, reader);
        } catch (EDFException | IOException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "File is corrupt or unreadable: " + name);
        } finally {
            if (reader != null) {
                try { reader.close(); } catch (Exception ignored) {}
            }
        }
    }

    public EdfChannelSignal getChannelSignal(String name, Integer channel) {
        Path file = getExistingFilePath(name);
        EDFreader reader = null;
        try {
            reader = new EDFreader(file.toString());
            if (channel == null || channel < 0 || channel >= reader.getNumSignals()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found: " + channel);
            }
            return channelToChannelSignalMapper(reader, channel);
        } catch (EDFException | IOException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "File is corrupt or unreadable: " + name);
        } finally {
            if (reader != null) {
                try { reader.close(); } catch (Exception ignored) {}
            }
        }
    }

    private Path getExistingFilePath(String name) {
        Path dir = Path.of(edfFileProperties.getFolderPath()).normalize();
        Path file = dir.resolve(name).normalize();

        if (!file.startsWith(dir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }
        if (!Files.isRegularFile(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found: " + name);
        }
        return file;
    }

    private EdfChannelSignal channelToChannelSignalMapper(EDFreader reader, int channel) throws IOException, EDFException {
        int total = (int) reader.getTotalSamples(channel);
        int[] rawSamples = new int[total];
        reader.rewind(channel);
        reader.readDigitalSamples(channel, rawSamples);

        double physicalMinimum = reader.getPhysicalMinimum(channel);
        double physicalMaximum = reader.getPhysicalMaximum(channel);
        int digitalMinimum = reader.getDigitalMinimum(channel);
        int digitalMaximum = reader.getDigitalMaximum(channel);
        double gain = (physicalMaximum - physicalMinimum) / (digitalMaximum - digitalMinimum);

        List<Double> samples = new ArrayList<>(total);
        boolean inconsistent = false;
        for (int rawSample : rawSamples) {
            if (rawSample < digitalMinimum || rawSample > digitalMaximum) {
                inconsistent = true;
            }
            samples.add((rawSample - digitalMinimum) * gain + physicalMinimum);
        }

        EdfChannelSignal edfChannelSignal = new EdfChannelSignal();
        edfChannelSignal.setChannelIndex(channel);
        edfChannelSignal.setChannelName(reader.getSignalLabel(channel).trim());
        edfChannelSignal.setSamplingFrequency(reader.getSampleFrequency(channel));
        edfChannelSignal.setIsInternallyInconsistent(inconsistent);
        edfChannelSignal.setSamples(samples);
        return edfChannelSignal;
    }

    private EdfFileContent fileToEdfFileContentMapper(Path file, EDFreader reader) throws EDFException {
        EdfFileContent content = new EdfFileContent();
        content.setFileName(file.getFileName().toString());
        content.setRecordingDate(OffsetDateTime.of(
            reader.getStartDateYear(), reader.getStartDateMonth(), reader.getStartDateDay(),
            reader.getStartTimeHour(), reader.getStartTimeMinute(), reader.getStartTimeSecond(),
            0, ZoneOffset.UTC));

        String patientName = reader.getPatientName();
        if (!isBlankOrUnknown(patientName)) {
            content.setPatientName(patientName);
        }

        List<EdfChannel> channels = new ArrayList<>();
        for (int i = 0; i < reader.getNumSignals(); i++) {
            String label = reader.getSignalLabel(i).trim();
            if (label.equals("EDF Annotations")) {
                continue;                                    // az annotation-csatorna nem valódi jel
            }
            EdfChannel channel = new EdfChannel();
            channel.setName(label);
            channel.setType(deriveType(label));
            channel.setPhysicalDimension(reader.getPhysicalDimension(i).trim());
            channel.setSamplingFrequency(reader.getSampleFrequency(i));
            channels.add(channel);
        }
        content.setChannels(channels);
        content.setNumberOfChannels(channels.size());

        content.setRecordingLengthSeconds(reader.getFileDuration() / 10_000_000.0);  // 100 ns → s
        content.setNumberOfAnnotations(reader.annotationslist.size());
        return content;
    }

    private String deriveType(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }
        int space = label.indexOf(' ');
        return space > 0 ? label.substring(0, space) : label;   // pl. "EEG Fpz-Cz" → "EEG"
    }

    private EdfFileSummary toEdfFileSummary(Path path) {
        EdfFileSummary summary = new EdfFileSummary();
        summary.setFileName(path.getFileName().toString());

        EDFreader reader = null;
        boolean readerFailed = false;
        try {
            reader = new EDFreader(path.toString());
            summary.setRecordingDate(OffsetDateTime.of(
                reader.getStartDateYear(), reader.getStartDateMonth(), reader.getStartDateDay(),
                reader.getStartTimeHour(), reader.getStartTimeMinute(), reader.getStartTimeSecond(),
                0, ZoneOffset.UTC));
            if (isMetadataMissing(reader)) {
                summary.setStatus(EdfFileStatus.MISSING_METADATA);
            } else {
                summary.setStatus(EdfFileStatus.VALID);
            }
        } catch (EDFException | IOException e) {
            readerFailed = true;
            log.debug("EDFreader failed for {}: {}", path, e.getMessage());
        } finally {
            if (reader != null) {
                try { reader.close(); } catch (Exception ignored) {}
            }
        }

        if (readerFailed) {
            summary.setStatus(isHeaderInconsistent(path)
                ? EdfFileStatus.INCONSISTENT_HEADER
                : EdfFileStatus.CORRUPT);
        }
        return summary;
    }

    private boolean isMetadataMissing(EDFreader reader) throws EDFException {
        if (reader.getNumSignals() == 0) {
            return true;
        }
        if (isBlankOrUnknown(reader.getPatientName())) {
            return true;
        }
        for (int i = 0; i < reader.getNumSignals(); i++) {
            if (reader.getSignalLabel(i).isBlank()) {
                return true;
            }
        }
        return false;
    }

    private boolean isBlankOrUnknown(String value) {
        return value == null || value.isBlank() || value.equals("X");
    }
}
