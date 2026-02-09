// src/data/locations.ts – AUTO_LOCATIONS สำหรับหน้า "รับซื้อโน๊ตบุ๊ค + จังหวัด/อำเภอ"
export type AutoLocation = {
  province: string;
  provinceSlug: string;
  district?: string;
  districtSlug?: string;
};

export const AUTO_LOCATIONS: AutoLocation[] = [
  // กรุงเทพมหานคร
  { province: "กรุงเทพมหานคร", provinceSlug: "bangkok" },
  { province: "กรุงเทพมหานคร", provinceSlug: "bangkok", district: "ดุสิต", districtSlug: "dusit" },
  { province: "กรุงเทพมหานคร", provinceSlug: "bangkok", district: "พญาไท", districtSlug: "phaya-thai" },

  // เชียงใหม่
  { province: "เชียงใหม่", provinceSlug: "chiang-mai" },
  { province: "เชียงใหม่", provinceSlug: "chiang-mai", district: "เมืองเชียงใหม่", districtSlug: "mueang-chiang-mai" },

  // ขอนแก่น
  { province: "ขอนแก่น", provinceSlug: "khon-kaen" },
  { province: "ขอนแก่น", provinceSlug: "khon-kaen", district: "เมืองขอนแก่น", districtSlug: "mueang-khon-kaen" },

  // นครราชสีมา
  { province: "นครราชสีมา", provinceSlug: "nakhon-ratchasima" },
  { province: "นครราชสีมา", provinceSlug: "nakhon-ratchasima", district: "เมืองนครราชสีมา", districtSlug: "mueang-nakhon-ratchasima" },

  // อุบลราชธานี
  { province: "อุบลราชธานี", provinceSlug: "ubon-ratchathani" },
  { province: "อุบลราชธานี", provinceSlug: "ubon-ratchathani", district: "เมืองอุบลราชธานี", districtSlug: "mueang-ubon-ratchathani" },

  // ชลบุรี
  { province: "ชลบุรี", provinceSlug: "chonburi" },
  { province: "ชลบุรี", provinceSlug: "chonburi", district: "เมืองชลบุรี", districtSlug: "mueang-chonburi" },

  // สมุทรปราการ
  { province: "สมุทรปราการ", provinceSlug: "samut-prakan" },
  { province: "สมุทรปราการ", provinceSlug: "samut-prakan", district: "เมืองสมุทรปราการ", districtSlug: "mueang-samut-prakan" },

  // นครศรีธรรมราช
  { province: "นครศรีธรรมราช", provinceSlug: "nakhon-si-thammarat" },
  { province: "นครศรีธรรมราช", provinceSlug: "nakhon-si-thammarat", district: "เมืองนครศรีธรรมราช", districtSlug: "mueang-nakhon-si-thammarat" },

  // พิษณุโลก
  { province: "พิษณุโลก", provinceSlug: "phitsanulok" },
  { province: "พิษณุโลก", provinceSlug: "phitsanulok", district: "เมืองพิษณุโลก", districtSlug: "mueang-phitsanulok" },

  // ระยอง
  { province: "ระยอง", provinceSlug: "rayong" },
  { province: "ระยอง", provinceSlug: "rayong", district: "เมืองระยอง", districtSlug: "mueang-rayong" },
];
