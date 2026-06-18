package com.inc.zeto.edfreader.controller;

import java.util.List;

import com.inc.zeto.edfreader.api.EdfFileReadingApi;
import com.inc.zeto.edfreader.api.model.EdfChannelSignal;
import com.inc.zeto.edfreader.api.model.EdfFileContent;
import com.inc.zeto.edfreader.api.model.EdfFileSummary;
import com.inc.zeto.edfreader.service.EdfFileReadingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EdfFileReadingController implements EdfFileReadingApi {

    private final EdfFileReadingService edfFileReadingService;

    @Override
    public ResponseEntity<EdfChannelSignal> getChannelSignal(String name, Integer channel) {
        return ResponseEntity.ok(edfFileReadingService.getChannelSignal(name, channel));
    }

    @Override
    public ResponseEntity<EdfFileContent> getFileByName(String name) {
        return ResponseEntity.ok(edfFileReadingService.getFileByName(name));
    }

    @Override
    public ResponseEntity<List<EdfFileSummary>> getFilesList() {
        return ResponseEntity.ok(edfFileReadingService.getAllFiles());
    }
}
