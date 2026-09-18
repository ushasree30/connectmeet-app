package connectmeet.controller;

import connectmeet.entity.Meeting;
import connectmeet.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:5177"
        }
)
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<Meeting> createMeeting(
            @RequestParam String title,
            @RequestParam String date,
            @RequestParam String time,
            @RequestParam Integer duration,
            @RequestParam String createdBy
    ) {

        Meeting meeting = meetingService.createMeeting(
                title,
                date,
                time,
                duration,
                createdBy
        );

        return ResponseEntity.ok(meeting);
    }

    @GetMapping
    public ResponseEntity<List<Meeting>> getAllMeetings() {

        return ResponseEntity.ok(
                meetingService.getAllMeetings()
        );
    }

    @GetMapping("/{meetingCode}")
    public ResponseEntity<Meeting> getMeeting(
            @PathVariable String meetingCode
    ) {

        Meeting meeting =
                meetingService.getMeetingByCode(meetingCode);

        return ResponseEntity.ok(meeting);
    }
}