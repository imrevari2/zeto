package com.inc.zeto.edfreader.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "project.edf-files")
public class EdfFileProperties {

    private String folderPath;
}
