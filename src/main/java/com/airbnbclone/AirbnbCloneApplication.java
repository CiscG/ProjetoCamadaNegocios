package com.airbnbclone;

import com.airbnbclone.cli.CliRunner;
import org.springframework.boot.Banner;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Arrays;

@SpringBootApplication
public class AirbnbCloneApplication {

    public static void main(String[] args) {
        boolean cliMode = Arrays.asList(args).contains("--cli");

        SpringApplicationBuilder builder = new SpringApplicationBuilder(AirbnbCloneApplication.class);

        if (cliMode) {
            System.setProperty("logging.level.root", "ERROR");
            builder.web(WebApplicationType.NONE)
                   .bannerMode(Banner.Mode.OFF)
                   .logStartupInfo(false);
        }

        ConfigurableApplicationContext ctx = builder.run(args);

        if (cliMode) {
            ctx.getBean(CliRunner.class).executar();
            ctx.close();
        }
    }
}
