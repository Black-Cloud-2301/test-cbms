export interface IUser {
  code: string;
  password: string;
  name: string;
}

export const USERS: Record<'NHUNG' | 'PC' | 'HONG' | 'TUOI' | 'CAM_NHUNG' | 'MANH', IUser> = {
  NHUNG: {
    code: '435319',
    password: 'Bear200!@#',
    name: 'Giang Thị Nhung'
  },
  PC: {
    code: '270504',
    password: 'Cntt@1337',
    name: 'Lê Thị Ngọc Ánh'
  },
  HONG: {
    code: '192981',
    password: 'Hoanganh2025a@*HH',
    name: 'Bùi Thị Hồng'
  },
  CAM_NHUNG: {
    code: '455651',
    password: 'Thang7nam25@',
    name: 'Nguyễn Thị Cẩm Nhung'
  },
  TUOI: {
    code: '293289',
    password: 'Vcc@2023',
    name: 'Tô Thị Thúy Tươi'
  },
  MANH: {
    code: '467607',
    password: 'Hoangnm36cons@',
    name: 'Lê Đức Mạnh'
  }
};

export const USER_LEAD = USERS.NHUNG;
export const USER_POLICY = USERS.CAM_NHUNG;
export const USER_TECH = USERS.HONG;
export const USER_FINANCE = USERS.TUOI;