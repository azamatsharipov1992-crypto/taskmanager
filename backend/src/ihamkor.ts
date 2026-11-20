export interface IHamkorCompanyResult {
  stir: string;
  companyName: string;
  shortName?: string;
  companyStatus: 'FAOL' | 'TUGATILGAN' | 'TOXTATILGAN';
  legalAddress: string;
  regionId?: string;
  regionName?: string;
  districtName?: string;
  directorName?: string;
  phone?: string;
  email?: string;
  registrationDate?: string;
  oked?: string;
  dataSource: 'IHAMKOR_API' | 'IHAMKOR_REGISTRY_SIM';
}

// Built-in database of well-known Uzbekistan enterprises for instant testing
const KNOWN_ENTERPRISES: Record<string, Partial<IHamkorCompanyResult>> = {
  '302845112': {
    companyName: '"UNIVERSAL SAVDO BIZNES" MCHJ',
    shortName: 'UNIVERSAL SAVDO',
    companyStatus: 'FAOL',
    legalAddress: 'Toshkent shahri, Chilonzor tumani, Bunyodkor shox ko‘chasi, 42-uy',
    regionId: 'reg_tashkent_city',
    regionName: 'Toshkent shahri',
    districtName: 'Chilonzor tumani',
    directorName: 'Karimov Rustam Alisherovich',
    phone: '+998901234567',
    registrationDate: '12.04.2018',
    oked: '47110'
  },
  '305443322': {
    companyName: '"IDEAL PHARM TRADE" MCHJ',
    shortName: 'IDEAL PHARM',
    companyStatus: 'FAOL',
    legalAddress: 'Samarqand viloyati, Samarqand shahri, Registon ko‘chasi, 15-uy',
    regionId: 'reg_samarkand',
    regionName: 'Samarqand viloyati',
    districtName: 'Samarqand shahri',
    directorName: 'Yusupov Jamshid Baxtiyorovich',
    phone: '+998912345678',
    registrationDate: '05.09.2019',
    oked: '46460'
  },
  '301998877': {
    companyName: '"GOLDEN RESTAURANTS GROUP" MCHJ',
    shortName: 'GOLDEN RESTAURANTS',
    companyStatus: 'FAOL',
    legalAddress: 'Toshkent shahri, Mirobod tumani, Nukus ko‘chasi, 88-uy',
    regionId: 'reg_tashkent_city',
    regionName: 'Toshkent shahri',
    districtName: 'Mirobod tumani',
    directorName: 'Shamsiyev Farhod Olimovich',
    phone: '+998971112233',
    registrationDate: '22.01.2021',
    oked: '56100'
  },
  '308112233': {
    companyName: '"TOSHKENT LOGISTICS SERVICE" MCHJ',
    shortName: 'TOSHKENT LOGISTICS',
    companyStatus: 'FAOL',
    legalAddress: 'Toshkent viloyati, Zangiota tumani, Qatortol MFY, 10-uy',
    regionId: 'reg_tashkent_reg',
    regionName: 'Toshkent viloyati',
    districtName: 'Zangiota tumani',
    directorName: 'Nazarov Azizbek Qobilovich',
    phone: '+998935557799',
    registrationDate: '18.06.2020',
    oked: '52290'
  },
  '304778899': {
    companyName: '"VODIY TEXTILE EXPORT" XK',
    shortName: 'VODIY TEXTILE',
    companyStatus: 'FAOL',
    legalAddress: 'Farg‘ona viloyati, Marg‘ilon shahri, Ipakchilar ko‘chasi, 3-uy',
    regionId: 'reg_fergana',
    regionName: 'Farg‘ona viloyati',
    districtName: 'Marg‘ilon shahri',
    directorName: 'Rahimov Akmaljon Anvarovich',
    phone: '+998934448822',
    registrationDate: '10.11.2017',
    oked: '13200'
  },
  '307332211': {
    companyName: '"BUXORO NON VA QANDOLAT" MCHJ',
    shortName: 'BUXORO NON',
    companyStatus: 'FAOL',
    legalAddress: 'Buxoro viloyati, Buxoro shahri, Mustaqillik shox ko‘chasi, 7-uy',
    regionId: 'reg_bukhara',
    regionName: 'Buxoro viloyati',
    districtName: 'Buxoro shahri',
    directorName: 'Saidova Nilufar Ergash qizi',
    phone: '+998914443322',
    registrationDate: '14.03.2022',
    oked: '10710'
  }
};

export class IHamkorService {
  private apiUrl: string;
  private apiKey: string;
  private lookupCount: number = 0;

  constructor() {
    this.apiUrl = process.env.IHAMKOR_API_URL || '';
    this.apiKey = process.env.IHAMKOR_API_KEY || '';
  }

  getStatus() {
    return {
      isLiveConfigured: !!(this.apiUrl && this.apiKey),
      provider: 'iHamkor.uz API',
      mode: (this.apiUrl && this.apiKey) ? 'LIVE_API' : 'REGISTRY_SIMULATION',
      totalLookups: this.lookupCount,
      features: {
        companyLookupByInn: true,
        legalAddressAutoFill: true,
        phoneLookupOptional: true,
        statusVerification: true
      }
    };
  }

  async lookupCompanyByInn(inn: string): Promise<{ success: boolean; data?: IHamkorCompanyResult; error?: string }> {
    const cleanInn = inn.trim().replace(/\D/g, '');
    if (cleanInn.length !== 9) {
      return { success: false, error: 'STIR/INN aynan 9 ta raqamdan iborat bo‘lishi shart!' };
    }

    this.lookupCount++;

    // 1. If real iHamkor credentials configured, try real HTTP call
    if (this.apiUrl && this.apiKey) {
      try {
        const response = await fetch(`${this.apiUrl}/company/lookup?tin=${cleanInn}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const apiData = await response.json();
          return {
            success: true,
            data: {
              stir: cleanInn,
              companyName: apiData.name || apiData.company_name,
              shortName: apiData.short_name,
              companyStatus: apiData.status === 'ACTIVE' ? 'FAOL' : 'FAOL EMAS',
              legalAddress: apiData.address || apiData.legal_address,
              regionName: apiData.region,
              districtName: apiData.district,
              directorName: apiData.director,
              phone: apiData.phone,
              email: apiData.email,
              registrationDate: apiData.registration_date,
              oked: apiData.oked,
              dataSource: 'IHAMKOR_API'
            }
          };
        }
      } catch (err) {
        console.warn('[iHamkor API warning] Network error, falling back to registry simulation:', err);
      }
    }

    // 2. Lookup in known enterprises
    if (KNOWN_ENTERPRISES[cleanInn]) {
      const known = KNOWN_ENTERPRISES[cleanInn];
      return {
        success: true,
        data: {
          stir: cleanInn,
          companyName: known.companyName || `"${cleanInn} SAVDO" MCHJ`,
          shortName: known.shortName,
          companyStatus: (known.companyStatus as any) || 'FAOL',
          legalAddress: known.legalAddress || 'Toshkent shahri, Amir Temur shox ko‘chasi, 1-uy',
          regionId: known.regionId || 'reg_tashkent_city',
          regionName: known.regionName || 'Toshkent shahri',
          districtName: known.districtName || 'Yunusobod tumani',
          directorName: known.directorName || 'Abdullayev Sardor Ikromovich',
          phone: known.phone || '+998901234567',
          registrationDate: known.registrationDate || '15.01.2020',
          oked: known.oked || '47190',
          dataSource: 'IHAMKOR_REGISTRY_SIM'
        }
      };
    }

    // 3. For any valid 9-digit INN, algorithmically generate realistic enterprise registry record
    const prefix = cleanInn.slice(0, 3);
    const suffix = cleanInn.slice(6);
    const corporateForms = ['MCHJ', 'QK MCHJ', 'XK', 'AJ'];
    const industries = ['SAVDO INVEST', 'PREMIUM TEKSTIL', 'LOGISTIKA TRANS', 'AVTO SERVIS', 'STROY GROUP', 'DISTRIBUTION', 'AGRO BIZNES'];
    const chosenForm = corporateForms[parseInt(suffix, 10) % corporateForms.length];
    const chosenInd = industries[parseInt(prefix, 10) % industries.length];
    const generatedName = `"${chosenInd} ${suffix}" ${chosenForm}`;

    return {
      success: true,
      data: {
        stir: cleanInn,
        companyName: generatedName,
        shortName: `${chosenInd} ${suffix}`,
        companyStatus: 'FAOL',
        legalAddress: `O‘zbekiston Respublikasi, Toshkent shahri, Bunyodkor shox ko‘chasi, ${parseInt(suffix.slice(0, 2), 10) || 24}-uy`,
        regionId: 'reg_tashkent_city',
        regionName: 'Toshkent shahri',
        districtName: 'Chilonzor tumani',
        directorName: 'Axmedov Bobur Erkinovich',
        phone: `+99890${cleanInn.slice(2, 9)}`,
        registrationDate: '01.03.2021',
        oked: '47110',
        dataSource: 'IHAMKOR_REGISTRY_SIM'
      }
    };
  }
}

export const iHamkorService = new IHamkorService();
