package io.activestack.helloworld;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Main{
    /**
     * Main function for starting the process
     */
    @SuppressWarnings({"unused","resource"})
    public static void main(String[] args){
        ApplicationContext context =
                new ClassPathXmlApplicationContext(
                        "spring/percero-spring-config.xml", // Includes Spring config from Active Stack
                        "spring/*.xml" // Includes Spring config from this project
                );

        System.out.println("\nSTARTUP COMPLETED SUCCESSFULLY\n");
    }
}
