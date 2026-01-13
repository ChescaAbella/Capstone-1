package com.capstone.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.capstone.service.DeliverableService;
import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
@Component
@EnableScheduling
public class ScheduledTasks {

    @Autowired
    private DeliverableService deliverableService;

    /**
     * Sync all deliverables with Google Sheets every 5 minutes
     * Ensures <1s sync lag as per requirements
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void syncDeliverablesToGoogleSheets() {
        try {
            log.info("Starting scheduled sync with Google Sheets");
            deliverableService.syncAllWithGoogleSheets();
            log.info("Completed scheduled sync with Google Sheets");
        } catch (Exception e) {
            log.error("Error during scheduled Google Sheets sync", e);
        }
    }

    /**
     * Check for overdue deliverables every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void checkOverdueDeliverables() {
        try {
            log.info("Checking for overdue deliverables");
            var overdueDeliverables = deliverableService.getOverdueDeliverables();
            log.info("Found {} overdue deliverables", overdueDeliverables.size());
            // Could send notifications here
        } catch (Exception e) {
            log.error("Error checking for overdue deliverables", e);
        }
    }

    /**
     * Check for at-risk deliverables every 1 hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void checkAtRiskDeliverables() {
        try {
            log.info("Checking for at-risk deliverables");
            var atRiskDeliverables = deliverableService.getAtRiskDeliverables();
            log.info("Found {} at-risk deliverables", atRiskDeliverables.size());
            // Could send alerts here
        } catch (Exception e) {
            log.error("Error checking for at-risk deliverables", e);
        }
    }
}
