package com.inc.zeto.edfreader.util;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public final class RawEdfHeaderInspector {

    private RawEdfHeaderInspector() {
    }

    public static boolean isHeaderInconsistent(Path path) {
        try {
            byte[] allBytes = Files.readAllBytes(path);
            if (allBytes.length < 256) {
                return false; //smaller than header size
            }
            int numberOfSignals = parseInt(allBytes, 252, 4);
            if (numberOfSignals <= 0) {
                return false;
            }
            long headerBytes = 256L + 256L * numberOfSignals;
            if (allBytes.length < headerBytes) {
                return false; //file too small to contain full header.
            }

            if (parseDouble(allBytes, 244, 8) <= 0) {
                return true; //data record duration is not positive
            }
            long numDataRecords = parseLong(allBytes, 236, 8);

            int physicalMinOff = 256 + numberOfSignals * 104;
            int physicalMaxOff = physicalMinOff + numberOfSignals * 8;
            int digitalMinOff = physicalMaxOff + numberOfSignals * 8;
            int digitalMaxOff = digitalMinOff + numberOfSignals * 8;
            int samplesOff = digitalMaxOff + numberOfSignals * 8 + numberOfSignals * 80;

            long samplesPerRecord = 0;
            for (int i = 0; i < numberOfSignals; i++) {
                int samples = parseInt(allBytes, samplesOff + i * 8, 8);
                if (samples <= 0) {
                    return true;
                }
                samplesPerRecord += samples;
                if (parseDouble(allBytes, physicalMinOff + i * 8, 8) == parseDouble(allBytes, physicalMaxOff + i * 8, 8)) {
                    return true;
                }
                if (parseInt(allBytes, digitalMinOff + i * 8, 8) == parseInt(allBytes, digitalMaxOff + i * 8, 8)) {
                    return true;
                }
            }

            long expectedData = numDataRecords * samplesPerRecord * 2;
            long actualData = allBytes.length - headerBytes;
            return actualData < expectedData;

        } catch (IOException | NumberFormatException e) {
            return false;
        }
    }

    private static String field(byte[] b, int offset, int length) {
        return new String(b, offset, length, StandardCharsets.US_ASCII).trim();
    }

    private static int parseInt(byte[] b, int offset, int length) {
        return Integer.parseInt(field(b, offset, length));
    }

    private static long parseLong(byte[] b, int offset, int length) {
        return Long.parseLong(field(b, offset, length));
    }

    private static double parseDouble(byte[] b, int offset, int length) {
        return Double.parseDouble(field(b, offset, length));
    }
}
