package connectmeet.service;

import connectmeet.entity.Meeting;
import connectmeet.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public Meeting createMeeting(
            String title,
            String date,
            String time,
            Integer duration,
            String createdBy
    ) {

        String meetingCode;

        do {
            meetingCode = "connect-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8);
        } while (meetingRepository.existsByMeetingCode(meetingCode));

        Meeting meeting = new Meeting(
                meetingCode,
                title,
                date,
                time,
                duration,
                createdBy
        );

        return meetingRepository.save(meeting);
    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public Meeting getMeetingByCode(String meetingCode) {

        return meetingRepository
                .findByMeetingCode(meetingCode)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Meeting not found"
                        )
                );
    }
}