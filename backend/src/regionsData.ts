export interface RegionData {
  id: string;
  code: string;
  name_uz: string;
  name_uz_cyrillic: string;
  name_ru: string;
  districts: DistrictData[];
}

export interface DistrictData {
  id: string;
  code: string;
  name_uz: string;
  name_ru: string;
}

export const UZBEKISTAN_REGIONS: RegionData[] = [
  {
    id: 'reg_tashkent_city',
    code: '10',
    name_uz: 'Toshkent shahri',
    name_uz_cyrillic: 'Тошкент шаҳри',
    name_ru: 'город Ташкент',
    districts: [
      { id: 'dist_tash_chilonzor', code: '1001', name_uz: 'Chilonzor tumani', name_ru: 'Чиланзарский район' },
      { id: 'dist_tash_yunusobod', code: '1002', name_uz: 'Yunusobod tumani', name_ru: 'Юнусабадский район' },
      { id: 'dist_tash_mirzoulugbek', code: '1003', name_uz: 'Mirzo Ulug‘bek tumani', name_ru: 'Мирзо-Улугбекский район' },
      { id: 'dist_tash_mirobod', code: '1004', name_uz: 'Mirobod tumani', name_ru: 'Мирабадский район' },
      { id: 'dist_tash_yakkasaroy', code: '1005', name_uz: 'Yakkasaroy tumani', name_ru: 'Яккасарайский район' },
      { id: 'dist_tash_shayxontohur', code: '1006', name_uz: 'Shayxontohur tumani', name_ru: 'Шайхантахурский район' },
      { id: 'dist_tash_olmazor', code: '1007', name_uz: 'Olmazor tumani', name_ru: 'Алмазарский район' },
      { id: 'dist_tash_uchtepa', code: '1008', name_uz: 'Uchtepa tumani', name_ru: 'Учтепинский район' },
      { id: 'dist_tash_sergeli', code: '1009', name_uz: 'Sergeli tumani', name_ru: 'Сергелийский район' },
      { id: 'dist_tash_yashnobod', code: '1010', name_uz: 'Yashnobod tumani', name_ru: 'Яшнабадский район' },
      { id: 'dist_tash_bektemir', code: '1011', name_uz: 'Bektemir tumani', name_ru: 'Бектемирский район' },
      { id: 'dist_tash_yangihayot', code: '1012', name_uz: 'Yangihayot tumani', name_ru: 'Янгихаётский район' }
    ]
  },
  {
    id: 'reg_tashkent_reg',
    code: '11',
    name_uz: 'Toshkent viloyati',
    name_uz_cyrillic: 'Тошкент вилояти',
    name_ru: 'Ташкентская область',
    districts: [
      { id: 'dist_tash_reg_chirchiq', code: '1101', name_uz: 'Chirchiq shahri', name_ru: 'город Чирчик' },
      { id: 'dist_tash_reg_angren', code: '1102', name_uz: 'Angren shahri', name_ru: 'город Ангрен' },
      { id: 'dist_tash_reg_olmaliq', code: '1103', name_uz: 'Olmaliq shahri', name_ru: 'город Алмалык' },
      { id: 'dist_tash_reg_bekobod', code: '1104', name_uz: 'Bekobod shahri', name_ru: 'город Бекабад' },
      { id: 'dist_tash_reg_qibray', code: '1105', name_uz: 'Qibray tumani', name_ru: 'Кибрайский район' },
      { id: 'dist_tash_reg_zangiota', code: '1106', name_uz: 'Zangiota tumani', name_ru: 'Зангиатинский район' },
      { id: 'dist_tash_reg_toshkent', code: '1107', name_uz: 'Toshkent tumani', name_ru: 'Ташкентский район' },
      { id: 'dist_tash_reg_bostonliq', code: '1108', name_uz: 'Bo‘stonliq tumani', name_ru: 'Бостанлыкский район' },
      { id: 'dist_tash_reg_yuqorichirchiq', code: '1109', name_uz: 'Yuqori Chirchiq tumani', name_ru: 'Юкоричирчикский район' },
      { id: 'dist_tash_reg_orta_chirchiq', code: '1110', name_uz: 'O‘rta Chirchiq tumani', name_ru: 'Уртачирчикский район' },
      { id: 'dist_tash_reg_yangiyol', code: '1111', name_uz: 'Yangiyo‘l shahri', name_ru: 'город Янгиюль' }
    ]
  },
  {
    id: 'reg_samarkand',
    code: '18',
    name_uz: 'Samarqand viloyati',
    name_uz_cyrillic: 'Самарқанд вилояти',
    name_ru: 'Самаркандская область',
    districts: [
      { id: 'dist_sam_shahri', code: '1801', name_uz: 'Samarqand shahri', name_ru: 'город Самарканд' },
      { id: 'dist_sam_kattaqorgon', code: '1802', name_uz: 'Kattaqo‘rg‘on shahri', name_ru: 'город Каттакурган' },
      { id: 'dist_sam_urgut', code: '1803', name_uz: 'Urgut tumani', name_ru: 'Ургутский район' },
      { id: 'dist_sam_pastdargom', code: '1804', name_uz: 'Pastdarg‘om tumani', name_ru: 'Пастдаргомский район' },
      { id: 'dist_sam_bulungur', code: '1805', name_uz: 'Bulung‘ur tumani', name_ru: 'Булунгурский район' },
      { id: 'dist_sam_jomboy', code: '1806', name_uz: 'Jomboy tumani', name_ru: 'Джамбайский район' },
      { id: 'dist_sam_ishtonxoja', code: '1807', name_uz: 'Ishtixon tumani', name_ru: 'Иштыханский район' },
      { id: 'dist_sam_oqdaryo', code: '1808', name_uz: 'Oqdaryo tumani', name_ru: 'Акдарьинский район' }
    ]
  },
  {
    id: 'reg_fergana',
    code: '30',
    name_uz: 'Farg‘ona viloyati',
    name_uz_cyrillic: 'Фарғона вилояти',
    name_ru: 'Ферганская область',
    districts: [
      { id: 'dist_fer_shahri', code: '3001', name_uz: 'Farg‘ona shahri', name_ru: 'город Фергана' },
      { id: 'dist_fer_qoqon', code: '3002', name_uz: 'Qo‘qon shahri', name_ru: 'город Коканд' },
      { id: 'dist_fer_margilon', code: '3003', name_uz: 'Marg‘ilon shahri', name_ru: 'город Маргилан' },
      { id: 'dist_fer_quva', code: '3004', name_uz: 'Quva tumani', name_ru: 'Кувинский район' },
      { id: 'dist_fer_oltiariq', code: '3005', name_uz: 'Oltiariq tumani', name_ru: 'Алтыарыкский район' },
      { id: 'dist_fer_rishton', code: '3006', name_uz: 'Rishton tumani', name_ru: 'Риштанский район' },
      { id: 'dist_fer_baxshontepa', code: '3007', name_uz: 'Bag‘dod tumani', name_ru: 'Багдадский район' },
      { id: 'dist_fer_uchkoprik', code: '3008', name_uz: 'Uchko‘prik tumani', name_ru: 'Учкуприкский район' }
    ]
  },
  {
    id: 'reg_andijan',
    code: '17',
    name_uz: 'Andijon viloyati',
    name_uz_cyrillic: 'Андижон вилояти',
    name_ru: 'Андижанская область',
    districts: [
      { id: 'dist_and_shahri', code: '1701', name_uz: 'Andijon shahri', name_ru: 'город Андижан' },
      { id: 'dist_and_asaka', code: '1702', name_uz: 'Asaka tumani', name_ru: 'Асакинский район' },
      { id: 'dist_and_xonobod', code: '1703', name_uz: 'Xonobod shahri', name_ru: 'город Ханабад' },
      { id: 'dist_and_shaxrixon', code: '1704', name_uz: 'Shahrixon tumani', name_ru: 'Шахриханский район' },
      { id: 'dist_and_baliqchi', code: '1705', name_uz: 'Baliqchi tumani', name_ru: 'Балыкчинский район' },
      { id: 'dist_and_oltinkol', code: '1706', name_uz: 'Oltinko‘l tumani', name_ru: 'Алтынкульский район' }
    ]
  },
  {
    id: 'reg_namangan',
    code: '16',
    name_uz: 'Namangan viloyati',
    name_uz_cyrillic: 'Наманган вилояти',
    name_ru: 'Наманганская область',
    districts: [
      { id: 'dist_nam_shahri', code: '1601', name_uz: 'Namangan shahri', name_ru: 'город Наманган' },
      { id: 'dist_nam_chust', code: '1602', name_uz: 'Chust tumani', name_ru: 'Чустский район' },
      { id: 'dist_nam_pop', code: '1603', name_uz: 'Pop tumani', name_ru: 'Папский район' },
      { id: 'dist_nam_kosonsoy', code: '1604', name_uz: 'Kosonsoy tumani', name_ru: 'Касансайский район' },
      { id: 'dist_nam_toraqorgon', code: '1605', name_uz: 'To‘raqo‘rg‘on tumani', name_ru: 'Туракурганский район' },
      { id: 'dist_nam_uchqorgon', code: '1606', name_uz: 'Uchqo‘rg‘on tumani', name_ru: 'Учкурганский район' }
    ]
  },
  {
    id: 'reg_bukhara',
    code: '20',
    name_uz: 'Buxoro viloyati',
    name_uz_cyrillic: 'Бухоро вилояти',
    name_ru: 'Бухарская область',
    districts: [
      { id: 'dist_bux_shahri', code: '2001', name_uz: 'Buxoro shahri', name_ru: 'город Бухара' },
      { id: 'dist_bux_kogon', code: '2002', name_uz: 'Kogon shahri', name_ru: 'город Каган' },
      { id: 'dist_bux_gijduvon', code: '2003', name_uz: 'G‘ijduvon tumani', name_ru: 'Гиждуванский район' },
      { id: 'dist_bux_vobkent', code: '2004', name_uz: 'Vobkent tumani', name_ru: 'Вабкентский район' },
      { id: 'dist_bux_jondor', code: '2005', name_uz: 'Jondor tumani', name_ru: 'Жондорский район' },
      { id: 'dist_bux_qorakol', code: '2006', name_uz: 'Qorako‘l tumani', name_ru: 'Каракульский район' }
    ]
  },
  {
    id: 'reg_kashkadarya',
    code: '19',
    name_uz: 'Qashqadaryo viloyati',
    name_uz_cyrillic: 'Қашқадарё вилояти',
    name_ru: 'Кашкадарьинская область',
    districts: [
      { id: 'dist_qash_qarshi', code: '1901', name_uz: 'Qarshi shahri', name_ru: 'город Карши' },
      { id: 'dist_qash_shahrisabz', code: '1902', name_uz: 'Shahrisabz shahri', name_ru: 'город Шахрисабз' },
      { id: 'dist_qash_koson', code: '1903', name_uz: 'Koson tumani', name_ru: 'Касанский район' },
      { id: 'dist_qash_kitob', code: '1904', name_uz: 'Kitob tumani', name_ru: 'Китабский район' },
      { id: 'dist_qash_nishon', code: '1905', name_uz: 'Nishon tumani', name_ru: 'Нишанский район' },
      { id: 'dist_qash_yakkabog', code: '1906', name_uz: 'Yakkabog‘ tumani', name_ru: 'Яккабагский район' }
    ]
  },
  {
    id: 'reg_surkhandarya',
    code: '22',
    name_uz: 'Surxondaryo viloyati',
    name_uz_cyrillic: 'Сурхондарё вилояти',
    name_ru: 'Сурхандарьинская область',
    districts: [
      { id: 'dist_sur_termiz', code: '2201', name_uz: 'Termiz shahri', name_ru: 'город Термез' },
      { id: 'dist_sur_denov', code: '2202', name_uz: 'Denov tumani', name_ru: 'Денауский район' },
      { id: 'dist_sur_sherobod', code: '2203', name_uz: 'Sherobod tumani', name_ru: 'Шерабадский район' },
      { id: 'dist_sur_boysun', code: '2204', name_uz: 'Boysun tumani', name_ru: 'Байсунский район' },
      { id: 'dist_sur_qumqorgon', code: '2205', name_uz: 'Qumqo‘rg‘on tumani', name_ru: 'Кумкурганский район' },
      { id: 'dist_sur_shorchi', code: '2206', name_uz: 'Sho‘rchi tumani', name_ru: 'Шурчинский район' }
    ]
  },
  {
    id: 'reg_khorezm',
    code: '23',
    name_uz: 'Xorazm viloyati',
    name_uz_cyrillic: 'Хоразм вилояти',
    name_ru: 'Хорезмская область',
    districts: [
      { id: 'dist_xor_urganch', code: '2301', name_uz: 'Urganch shahri', name_ru: 'город Ургенч' },
      { id: 'dist_xor_xiva', code: '2302', name_uz: 'Xiva shahri', name_ru: 'город Хива' },
      { id: 'dist_xor_xonqa', code: '2303', name_uz: 'Xonqa tumani', name_ru: 'Ханкинский район' },
      { id: 'dist_xor_shovot', code: '2304', name_uz: 'Shovot tumani', name_ru: 'Шаватский район' },
      { id: 'dist_xor_gurlan', code: '2305', name_uz: 'Gurlan tumani', name_ru: 'Гурленский район' },
      { id: 'dist_xor_hazorasp', code: '2306', name_uz: 'Hazorasp tumani', name_ru: 'Хазараспский район' }
    ]
  },
  {
    id: 'reg_navoiy',
    code: '21',
    name_uz: 'Navoiy viloyati',
    name_uz_cyrillic: 'Навоий вилояти',
    name_ru: 'Навоийская область',
    districts: [
      { id: 'dist_nav_shahri', code: '2101', name_uz: 'Navoiy shahri', name_ru: 'город Навои' },
      { id: 'dist_nav_zarafshon', code: '2102', name_uz: 'Zarafshon shahri', name_ru: 'город Зарафшан' },
      { id: 'dist_nav_karmana', code: '2103', name_uz: 'Karmana tumani', name_ru: 'Карманинский район' },
      { id: 'dist_nav_qiziltepa', code: '2104', name_uz: 'Qiziltepa tumani', name_ru: 'Кызылтепинский район' },
      { id: 'dist_nav_xatirchi', code: '2105', name_uz: 'Xatirchi tumani', name_ru: 'Хатырчинский район' },
      { id: 'dist_nav_uchquduq', code: '2106', name_uz: 'Uchquduq tumani', name_ru: 'Учкудукский район' }
    ]
  },
  {
    id: 'reg_jizzakh',
    code: '13',
    name_uz: 'Jizzax viloyati',
    name_uz_cyrillic: 'Жиззах вилояти',
    name_ru: 'Джизакская область',
    districts: [
      { id: 'dist_jiz_shahri', code: '1301', name_uz: 'Jizzax shahri', name_ru: 'город Джизак' },
      { id: 'dist_jiz_sharof_rashidov', code: '1302', name_uz: 'Sharof Rashidov tumani', name_ru: 'Шараф-Рашидовский район' },
      { id: 'dist_jiz_zomin', code: '1303', name_uz: 'Zomin tumani', name_ru: 'Зааминский район' },
      { id: 'dist_jiz_paxtakor', code: '1304', name_uz: 'Paxtakor tumani', name_ru: 'Пахтакорский район' },
      { id: 'dist_jiz_gallaorol', code: '1305', name_uz: 'G‘allaorol tumani', name_ru: 'Галляаральский район' },
      { id: 'dist_jiz_dustlik', code: '1306', name_uz: 'Do‘stlik tumani', name_ru: 'Дустликский район' }
    ]
  },
  {
    id: 'reg_sirdaryo',
    code: '12',
    name_uz: 'Sirdaryo viloyati',
    name_uz_cyrillic: 'Сирдарё вилояти',
    name_ru: 'Сырдарьинская область',
    districts: [
      { id: 'dist_sir_guliston', code: '1201', name_uz: 'Guliston shahri', name_ru: 'город Гулистан' },
      { id: 'dist_sir_shirin', code: '1202', name_uz: 'Shirin shahri', name_ru: 'город Ширин' },
      { id: 'dist_sir_yangiyer', code: '1203', name_uz: 'Yangiyer shahri', name_ru: 'город Янгиер' },
      { id: 'dist_sir_boyovut', code: '1204', name_uz: 'Boyovut tumani', name_ru: 'Баяутский район' },
      { id: 'dist_sir_sayxunobod', code: '1205', name_uz: 'Sayxunobod tumani', name_ru: 'Сайхунабадский район' },
      { id: 'dist_sir_sardoba', code: '1206', name_uz: 'Sardoba tumani', name_ru: 'Сардобинский район' }
    ]
  },
  {
    id: 'reg_qr',
    code: '14',
    name_uz: 'Qoraqalpog‘iston Respublikasi',
    name_uz_cyrillic: 'Қорақалпоғистон Республикаси',
    name_ru: 'Республика Каракалпакстан',
    districts: [
      { id: 'dist_qr_nukus', code: '1401', name_uz: 'Nukus shahri', name_ru: 'город Нукус' },
      { id: 'dist_qr_xojayli', code: '1402', name_uz: 'Xo‘jayli tumani', name_ru: 'Ходжейлийский район' },
      { id: 'dist_qr_beruniy', code: '1403', name_uz: 'Beruniy tumani', name_ru: 'Берунийский район' },
      { id: 'dist_qr_tortkol', code: '1404', name_uz: 'To‘rtko‘l tumani', name_ru: 'Турткульский район' },
      { id: 'dist_qr_amudaryo', code: '1405', name_uz: 'Amudaryo tumani', name_ru: 'Амударьинский район' },
      { id: 'dist_qr_qongirot', code: '1406', name_uz: 'Qo‘ng‘irot tumani', name_ru: 'Кунградский район' },
      { id: 'dist_qr_chimboy', code: '1407', name_uz: 'Chimboy tumani', name_ru: 'Чимбайский район' }
    ]
  }
];
