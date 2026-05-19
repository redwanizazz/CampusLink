import axiosInstance from './axiosInstance';

export const getEnrolledCourses = () => axiosInstance.get('/academics/courses').then(r => r.data);
export const getAttendance = () => axiosInstance.get('/academics/attendance').then(r => r.data);
export const getMarks = () => axiosInstance.get('/academics/marks').then(r => r.data);
export const getCgpa = () => axiosInstance.get('/academics/cgpa').then(r => r.data);
export const getRoutine = () => axiosInstance.get('/academics/routine').then(r => r.data);
