package connectmeet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "meetings")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String meetingCode;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private String createdBy;

    public Meeting() {
    }

    public Meeting(
            String meetingCode,
            String title,
            String date,
            String time,
            Integer duration,
            String createdBy
    ) {
        this.meetingCode = meetingCode;
        this.title = title;
        this.date = date;
        this.time = time;
        this.duration = duration;
        this.createdBy = createdBy;
    }

    public Long getId() {
        return id;
    }

    public String getMeetingCode() {
        return meetingCode;
    }

    public void setMeetingCode(String meetingCode) {
        this.meetingCode = meetingCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}