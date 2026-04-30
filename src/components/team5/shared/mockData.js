// Mock data for development/testing without backend
export const mockScheduledInterviews = [
  {
    id: 1,
    studentId: 1,
    slotId: 101,
    interviewStatus: 'Scheduled',
    comments: 'אנא הגע 5 דקות קודם לכן',
    slotStart: new Date(2026, 3, 28, 10, 0).toISOString(),
    slotEnd: new Date(2026, 3, 28, 10, 30).toISOString(),
    place: 'חדר 301 - בניין הנהלה',
    interviewType: 'Technical',
    interviewerName: 'דר. משה כהן',
    subject: 'Java'
  },
  {
    id: 2,
    studentId: 1,
    slotId: 102,
    interviewStatus: 'Scheduled',
    comments: null,
    slotStart: new Date(2026, 4, 5, 14, 0).toISOString(),
    slotEnd: new Date(2026, 4, 5, 14, 45).toISOString(),
    place: 'זום - קישור ישלח במייל',
    interviewType: 'Professional',
    interviewerName: 'גברת רחל לוי',
    subject: 'Python'
  },
  {
    id: 3,
    studentId: 1,
    slotId: 103,
    interviewStatus: 'Completed',
    comments: 'ביצועים טובים מאוד',
    slotStart: new Date(2026, 3, 20, 9, 0).toISOString(),
    slotEnd: new Date(2026, 3, 20, 9, 30).toISOString(),
    place: 'חדר 201 - בניין הנהלה',
    interviewType: 'Technical',
    interviewerName: 'ד"ר יוסי גרוס',
    subject: 'React'
  },
  {
    id: 4,
    studentId: 1,
    slotId: 104,
    interviewStatus: 'Completed',
    comments: null,
    slotStart: new Date(2026, 3, 15, 11, 30).toISOString(),
    slotEnd: new Date(2026, 3, 15, 12, 0).toISOString(),
    place: 'חדר 102 - בניין הנהלה',
    interviewType: 'Personal',
    interviewerName: 'מר אברהם דדון',
    subject: 'C#'
  },
  {
    id: 5,
    studentId: 1,
    slotId: 105,
    interviewStatus: 'Cancelled',
    comments: 'בוטל על ידי השיבוץ',
    slotStart: new Date(2026, 3, 25, 16, 0).toISOString(),
    slotEnd: new Date(2026, 3, 25, 16, 30).toISOString(),
    place: 'חדר 401 - בניין הנהלה',
    interviewType: 'Professional',
    interviewerName: 'גברת שרה מישר',
    subject: 'JavaScript'
  },
  {
    id: 6,
    studentId: 1,
    slotId: 106,
    interviewStatus: 'Scheduled',
    comments: 'אנא הביאו קו"ח מודפס',
    slotStart: new Date(2026, 4, 12, 13, 0).toISOString(),
    slotEnd: new Date(2026, 4, 12, 13, 45).toISOString(),
    place: 'חדר 205 - בניין הנהלה',
    interviewType: 'Technical',
    interviewerName: 'ד"ר אלכס כץ',
    subject: 'SQL'
  }
];
