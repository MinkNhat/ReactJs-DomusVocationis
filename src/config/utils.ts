import { IPermission } from "@/types/backend";
import { grey, green, blue, red, orange } from "@ant-design/colors";
import dayjs from "dayjs";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import img01 from "@/assets/patterns/img01.jpg";
import img02 from "@/assets/patterns/img02.jpg";
import img03 from "@/assets/patterns/img03.jpg";
import img04 from "@/assets/patterns/img04.jpg";
import img05 from "@/assets/patterns/img05.jpg";
import img06 from "@/assets/patterns/img06.jpg";
import img07 from "@/assets/patterns/img07.jpg";
import img08 from "@/assets/patterns/img08.jpg";

dayjs.extend(utc);
dayjs.extend(timezone);

export const FORMATE_DATE_ENG = "YYYY-MM-DD";
export const FORMATE_DATE_VN = "DD-MM-YYYY";
export const FORMATE_DATE_TIME_ENG = "YYYY-MM-DD HH:mm:ss";
export const FORMATE_DATE_TIME_VN = "HH:mm:ss DD-MM-YYYY";
export const FORMATE_DATE_TIME_UTC = "YYYY-MM-DDTHH:mm:ss[Z]";

export const dateRangeValidate = (dateRange: any) => {
  if (!dateRange) return undefined;
  const startDate = dayjs(dateRange[0]).format(FORMATE_DATE_TIME_ENG);
  const endDate = dayjs(dateRange[1]).format(FORMATE_DATE_TIME_ENG);

  return [startDate, endDate];
};

export function convertToUTC(time: string, format: string) {
  return dayjs(time, format).utcOffset(7).utc().format(FORMATE_DATE_TIME_UTC);
}

export function getNowUTC() {
  return dayjs().utc();
}

export const SKILLS_LIST = [
  { label: "React.JS", value: "REACT.JS" },
  { label: "React Native", value: "REACT NATIVE" },
  { label: "Vue.JS", value: "VUE.JS" },
  { label: "Angular", value: "ANGULAR" },
  { label: "Nest.JS", value: "NEST.JS" },
  { label: "TypeScript", value: "TYPESCRIPT" },
  { label: "Java", value: "JAVA" },
  { label: "Java Spring", value: "JAVA SPRING" },
  { label: "Frontend", value: "FRONTEND" },
  { label: "Backend", value: "BACKEND" },
  { label: "Fullstack", value: "FULLSTACK" },
];

export const LOCATION_LIST = [
  { label: "Hà Nội", value: "HANOI" },
  { label: "Hồ Chí Minh", value: "HOCHIMINH" },
  { label: "Đà Nẵng", value: "DANANG" },
  { label: "Others", value: "OTHER" },
];

export const PERIOD_TYPE_LIST = [
  { label: "Nấu ăn", value: "COOKING", color: "magenta", icon: "HomeFilled" },
  {
    label: "Nghỉ phép",
    value: "VACATION",
    color: "purple",
    icon: "HomeFilled",
  },
  { label: "Khác", value: "OTHER", color: "", icon: "HeartTwoTone" },
];

export const PERIOD_STATUS_LIST = [
  { label: "Đang chờ", value: "PENDING", color: "gold" },
  { label: "Mở", value: "OPENING", color: "blue" },
  { label: "Đóng", value: "CLOSED", color: "" },
];

export const PERIOD_SESSION_LIST = [
  { label: "Sáng", value: "MORNING", color: "green" },
  { label: "Trưa", value: "AFTERNOON", color: "cyan" },
  { label: "Tối", value: "EVENING", color: "blue" },
  { label: "Cả ngày", value: "ALL_DAY", color: "volcano" },
];

export const PERIOD_DAY_OF_WEEK_LIST = [
  { label: "CN", value: "0" },
  { label: "T2", value: "1" },
  { label: "T3", value: "2" },
  { label: "T4", value: "3" },
  { label: "T5", value: "4" },
  { label: "T6", value: "5" },
  { label: "T7", value: "6" },
];

export const nonAccentVietnamese = (str: string) => {
  str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str;
};

export const convertSlug = (str: string) => {
  str = nonAccentVietnamese(str);
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from =
    "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
  const to =
    "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
};

export const getLocationName = (value: string) => {
  const locationFilter = LOCATION_LIST.filter((item) => item.value === value);
  if (locationFilter.length) return locationFilter[0].label;
  return "unknown";
};

export function colorMethod(
  method: "POST" | "PUT" | "GET" | "DELETE" | string
) {
  switch (method) {
    case "POST":
      return green[6];
    case "PUT":
      return orange[6];
    case "GET":
      return blue[6];
    case "DELETE":
      return red[6];
    default:
      return grey[10];
  }
}

export function convertGender(
  gender: "MALE" | "FEMALE" | "OTHER" | string | undefined
) {
  switch (gender) {
    case "MALE":
      return "Nam";
    case "FEMALE":
      return "Nữ";
    case "OTHER":
      return "Khác";
    default:
      return undefined;
  }
}

export const groupByPermission = (
  data: any[]
): { module: string; permissions: IPermission[] }[] => {
  const groupedData = groupBy(data, (x) => x.module);
  return map(groupedData, (value, key) => {
    return { module: key, permissions: value as IPermission[] };
  });
};

export function calcMaxSlots(
  dateRange: any,
  allowedSessions: any = [],
  excludedDaysOfWeek: {
    label: string;
    value: string;
  }[] = [],
  peoplePerSession: any
) {
  const start = dayjs(dateRange[0]).startOf("day");
  const end = dayjs(dateRange[1]).startOf("day");
  const excludedDay = (excludedDaysOfWeek || []).map((s) => s.value);
  const sessions = Array.isArray(allowedSessions) ? allowedSessions : [];

  let current = start.clone();
  let validDays = 0;

  while (current.isSame(end) || current.isBefore(end)) {
    const dayOfWeek = current.day();
    if (!excludedDay.includes(dayOfWeek.toString())) {
      validDays++;
    }
    current = current.add(1, "day");
  }

  return validDays * sessions.length * (peoplePerSession || 0);
}

export const PATTERN_IMAGES_LIST = [
  img01,
  img02,
  img03,
  img04,
  img05,
  img06,
  img07,
  img08,
];
