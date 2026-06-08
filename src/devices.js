/**
 * ═══════════════════════════════════════════════════════════════
 *  设备数据库 — 用于 UA 解析工具的设备型号识别
 *  数据来源: https://github.com/KHwang9883/MobileModels/brands
 *  格式: { model_key: { brand, name, type } }
 *  每次新增品牌请参考上游仓库的 brands 目录
 * ═══════════════════════════════════════════════════════════════
 */
window.DeviceDB = (function() {
  'use strict';

  // ── 品牌映射表 ──
  var BRANDS = {
    // 国产手机品牌
    xiaomi:    { zh: '小米',   en: 'Xiaomi' },
    redmi:     { zh: '红米',   en: 'Redmi' },
    poco:      { zh: 'POCO',   en: 'POCO' },
    huawei:    { zh: '华为',   en: 'Huawei' },
    honor:     { zh: '荣耀',   en: 'Honor' },
    oneplus:   { zh: '一加',   en: 'OnePlus' },
    oppo:      { zh: 'OPPO',   en: 'OPPO' },
    realme:    { zh: '真我',   en: 'realme' },
    vivo:      { zh: 'vivo',   en: 'vivo' },
    iqoo:      { zh: 'iQOO',   en: 'iQOO' },
    meizu:     { zh: '魅族',   en: 'Meizu' },
    smartisan: { zh: '坚果',   en: 'Smartisan' },
    lenovo:    { zh: '联想',   en: 'Lenovo' },
    letv:      { zh: '乐视',   en: 'LeEco' },
    coolpad:   { zh: '酷派',   en: 'Coolpad' },
    nubia:     { zh: '努比亚', en: 'Nubia' },
    nothing:   { zh: 'Nothing',en: 'Nothing' },
    zte:       { zh: '中兴',   en: 'ZTE' },
    blackshark:{ zh: '黑鲨',   en: 'Black Shark' },
    '360':     { zh: '360',    en: '360' },
    zhixuan:   { zh: '华为智选',en: 'Zhixuan' },

    // 国际品牌
    apple:     { zh: '苹果',   en: 'Apple' },
    samsung:   { zh: '三星',   en: 'Samsung' },
    google:    { zh: '谷歌',   en: 'Google' },
    motorola:  { zh: '摩托罗拉',en: 'Motorola' },
    nokia:     { zh: '诺基亚', en: 'Nokia' },
    sony:      { zh: '索尼',   en: 'Sony' },
    asus:      { zh: '华硕',   en: 'ASUS' },
    lg:        { zh: 'LG',     en: 'LG' },
    tcl:       { zh: 'TCL',    en: 'TCL' }
  };

  // ── 设备型号数据库 ──
  // 格式: 'MODEL_CODE': ['品牌键名', '设备名称', '类型']
  // 类型: phone / tablet / watch / band / tv
  var MODELS = {};

  // ═══════════════════════════
  //  Apple (苹果)
  // ═══════════════════════════
  // iPhone
  MODELS['iPhone1,1'] = ['apple', 'iPhone', 'phone'];
  MODELS['iPhone1,2'] = ['apple', 'iPhone 3G', 'phone'];
  MODELS['iPhone2,1'] = ['apple', 'iPhone 3GS', 'phone'];
  MODELS['iPhone3,1'] = ['apple', 'iPhone 4', 'phone'];
  MODELS['iPhone3,3'] = ['apple', 'iPhone 4 (CDMA)', 'phone'];
  MODELS['iPhone4,1'] = ['apple', 'iPhone 4S', 'phone'];
  MODELS['iPhone5,1'] = ['apple', 'iPhone 5 (GSM)', 'phone'];
  MODELS['iPhone5,2'] = ['apple', 'iPhone 5 (Global)', 'phone'];
  MODELS['iPhone5,3'] = ['apple', 'iPhone 5c', 'phone'];
  MODELS['iPhone5,4'] = ['apple', 'iPhone 5c (GSM)', 'phone'];
  MODELS['iPhone6,1'] = ['apple', 'iPhone 5s', 'phone'];
  MODELS['iPhone6,2'] = ['apple', 'iPhone 5s (Global)', 'phone'];
  MODELS['iPhone7,1'] = ['apple', 'iPhone 6 Plus', 'phone'];
  MODELS['iPhone7,2'] = ['apple', 'iPhone 6', 'phone'];
  MODELS['iPhone8,1'] = ['apple', 'iPhone 6s', 'phone'];
  MODELS['iPhone8,2'] = ['apple', 'iPhone 6s Plus', 'phone'];
  MODELS['iPhone8,4'] = ['apple', 'iPhone SE', 'phone'];
  MODELS['iPhone9,1'] = ['apple', 'iPhone 7', 'phone'];
  MODELS['iPhone9,2'] = ['apple', 'iPhone 7 Plus', 'phone'];
  MODELS['iPhone9,3'] = ['apple', 'iPhone 7 (GSM)', 'phone'];
  MODELS['iPhone9,4'] = ['apple', 'iPhone 7 Plus (GSM)', 'phone'];
  MODELS['iPhone10,1'] = ['apple', 'iPhone 8', 'phone'];
  MODELS['iPhone10,2'] = ['apple', 'iPhone 8 Plus', 'phone'];
  MODELS['iPhone10,3'] = ['apple', 'iPhone X', 'phone'];
  MODELS['iPhone10,4'] = ['apple', 'iPhone 8 (GSM)', 'phone'];
  MODELS['iPhone10,5'] = ['apple', 'iPhone 8 Plus (GSM)', 'phone'];
  MODELS['iPhone10,6'] = ['apple', 'iPhone X (GSM)', 'phone'];
  MODELS['iPhone11,2'] = ['apple', 'iPhone XS', 'phone'];
  MODELS['iPhone11,4'] = ['apple', 'iPhone XS Max', 'phone'];
  MODELS['iPhone11,6'] = ['apple', 'iPhone XS Max (Global)', 'phone'];
  MODELS['iPhone11,8'] = ['apple', 'iPhone XR', 'phone'];
  MODELS['iPhone12,1'] = ['apple', 'iPhone 11', 'phone'];
  MODELS['iPhone12,3'] = ['apple', 'iPhone 11 Pro', 'phone'];
  MODELS['iPhone12,5'] = ['apple', 'iPhone 11 Pro Max', 'phone'];
  MODELS['iPhone12,8'] = ['apple', 'iPhone SE (2nd)', 'phone'];
  MODELS['iPhone13,1'] = ['apple', 'iPhone 12 mini', 'phone'];
  MODELS['iPhone13,2'] = ['apple', 'iPhone 12', 'phone'];
  MODELS['iPhone13,3'] = ['apple', 'iPhone 12 Pro', 'phone'];
  MODELS['iPhone13,4'] = ['apple', 'iPhone 12 Pro Max', 'phone'];
  MODELS['iPhone14,2']  ',14,4'] = ['apple', 'iPhone 13 mini', 'phone'];
  MODELS['iPhone14,5'] = ['apple', 'iPhone 13', 'phone = iPhone']',ELS['iPhone15,2'] = ['apple', 'iPhone 14 Pro', 'phone'];
  MODELS['iPhone15,3'] = ['apple', 'iPhone 14 Pro Max', 'phone'];
  MODELS['iPhone15,4'] = ['apple', 'iPhone 15', 'phone'];
  MODELS['iPhone15,5'] = ['apple', 'iPhone 15 Plus', 'phone'];
  MODELS['iPhone16,1'] = ['apple', 'iPhone 15 Pro', 'phone'];
  MODELS['iPhone16,2'] = ['apple', 'iPhone 15 Pro Max', 'phone'];
  MODELS['iPhone17,1'] = ['apple', 'iPhone 16 Pro', 'phone'];
  MODELS['iPhone17,2'] = ['apple', 'iPhone 16 Pro Max', 'phone'];
  MODELS['iPhone17,3'] = ['apple', 'iPhone 16', 'phone'];
  MODELS['iPhone17,4'] = ['apple', 'iPhone 16 Plus', 'phone'];
  MODELS['iPhone17,5'] = ['apple', 'iPhone 16e', 'phone'];
  MODELS['iPhone18,1'] = ['apple', 'iPhone 17 Pro', 'phone'];
  MODELS['iPhone18,2'] = ['apple', 'iPhone 17 Pro Max', 'phone'];
  MODELS['iPhone18,3'] = ['apple', 'iPhone 17', 'phone'];
  MODELS['iPhone18,4'] = ['apple', 'iPhone Air', 'phone'];
  MODELS['iPhone18,5'] = ['apple', 'iPhone 17e', 'phone'];

  // iPad
  MODELS['iPad1,1'] = ['apple', 'iPad', 'tablet'];
  MODELS['iPad2,1'] = ['apple', 'iPad 2', 'tablet'];
  MODELS['iPad3,1'] = ['apple', 'iPad (3rd)', 'tablet'];
  MODELS['iPad3,4'] = ['apple', 'iPad (4th)', 'tablet'];
  MODELS['iPad4,1'] = ['apple', 'iPad Air', 'tablet'];
  MODELS['iPad5,3'] = ['apple', 'iPad Air 2', 'tablet'];
  MODELS['iPad6,11'] = ['apple', 'iPad (5th)', 'tablet'];
  MODELS['iPad7,5'] = ['apple', 'iPad (6th)', 'tablet'];
  MODELS['iPad13,18'] = ['apple', 'iPad (10th)', 'tablet'];
  MODELS['iPad2,5'] = ['apple', 'iPad mini', 'tablet'];
  MODELS['iPad4,4'] = ['apple', 'iPad mini 2', 'tablet'];
  MODELS['iPad5,1'] = ['apple', 'iPad mini 4', 'tablet'];
  MODELS['iPad14,1'] = ['apple', 'iPad mini (6th)', 'tablet'];
  MODELS['iPad6,3'] = ['apple', 'iPad Pro (9.7-inch)', 'tablet'];
  MODELS['iPad6,7'] = ['apple', 'iPad Pro (12.9-inch)', 'tablet'];
  MODELS['iPad8,1'] = ['apple', 'iPad Pro (11-inch)', 'tablet'];
  MODELS['iPad8,5'] = ['apple', 'iPad Pro (12.9-inch, 3rd)', 'tablet'];
  MODELS['iPad13,4'] = ['apple', 'iPad Pro (11-inch, 3rd)', 'tablet'];
  MODELS['iPad13,8'] = ['apple', 'iPad Pro (12.9-inch, 5th)', 'tablet'];
  MODELS['iPad16,3'] = ['apple', 'iPad Pro (11-inch, M4)', 'tablet'];
  MODELS['iPad16,5'] = ['apple', 'iPad Pro (13-inch, M4)', 'tablet'];
  MODELS['iPad17,1'] = ['apple', 'iPad Pro (11-inch, M5)', 'tablet'];

  // Apple Watch
  MODELS['Watch1,1'] = ['apple', 'Apple Watch (1st) 38mm', 'watch'];
  MODELS['Watch2,3'] = ['apple', 'Apple Watch Series 2 38mm', 'watch'];
  MODELS['Watch3,1'] = ['apple', 'Apple Watch Series 3 38mm', 'watch'];
  MODELS['Watch4,1'] = ['apple', 'Apple Watch Series 4 40mm', 'watch'];
  MODELS['Watch5,1'] = ['apple', 'Apple Watch Series 5 40mm', 'watch'];
  MODELS['Watch6,1'] = ['apple', 'Apple Watch Series 6 40mm', 'watch'];
  MODELS['Watch6,6'] = ['apple', 'Apple Watch Series 7 41mm', 'watch'];
  MODELS['Watch6,14'] = ['apple', 'Apple Watch Series 8 41mm', 'watch'];
  MODELS['Watch6,18'] = ['apple', 'Apple Watch Ultra', 'watch'];
  MODELS['Watch7,1'] = ['apple', 'Apple Watch Series 9 41mm', 'watch'];
  MODELS['Watch7,5'] = ['apple', 'Apple Watch Ultra 2', 'watch'];

  // ═══════════════════════════
  //  Xiaomi (小米)
  // ═══════════════════════════
  MODELS['MI 1'] = ['xiaomi', '小米 1', 'phone'];
  MODELS['MI 2'] = ['xiaomi', '小米 2', 'phone'];
  MODELS['MI 2S'] = ['xiaomi', '小米 2S', 'phone'];
  MODELS['MI 3'] = ['xiaomi', '小米 3', 'phone'];
  MODELS['MI 4'] = ['xiaomi', '小米 4', 'phone'];
  MODELS['MI 4C'] = ['xiaomi', '小米 4c', 'phone'];
  MODELS['MI 5'] = ['xiaomi', '小米 5', 'phone'];
  MODELS['MI 5S'] = ['xiaomi', '小米 5s', 'phone'];
  MODELS['MI 6'] = ['xiaomi', '小米 6', 'phone'];
  MODELS['MI 8'] = ['xiaomi', '小米 8', 'phone'];
  MODELS['MI 9'] = ['xiaomi', '小米 9', 'phone'];
  MODELS['MI 10'] = ['xiaomi', '小米 10', 'phone'];
  MODELS['MI 10S'] = ['xiaomi', '小米 10S', 'phone'];
  MODELS['MI 11'] = ['xiaomi', '小米 11', 'phone'];
  MODELS['MI 11X'] = ['xiaomi', '小米 11X', 'phone'];
  MODELS['MI 11X Pro'] = ['xiaomi', '小米 11X Pro', 'phone'];
  MODELS['MI 11i'] = ['xiaomi', '小米 11i', 'phone'];
  MODELS['MI 11T'] = ['xiaomi', '小米 11T', 'phone'];
  MODELS['MI 11T Pro'] = ['xiaomi', '小米 11T Pro', 'phone'];
  MODELS['MI PAD'] = ['xiaomi', '小米平板', 'tablet'];
  MODELS['MI PAD 2'] = ['xiaomi', '小米平板 2', 'tablet'];
  MODELS['MI PAD 3'] = ['xiaomi', '小米平板 3', 'tablet'];
  MODELS['MI PAD 4'] = ['xiaomi', '小米平板 4', 'tablet'];
  MODELS['MI MAX'] = ['xiaomi', '小米 Max', 'phone'];
  MODELS['MI MIX'] = ['xiaomi', '小米 MIX', 'phone'];
  MODELS['MI MIX 2'] = ['xiaomi', '小米 MIX 2', 'phone'];
  MODELS['MI MIX 2S'] = ['xiaomi', '小米 MIX 2S', 'phone'];
  MODELS['MI MIX 3'] = ['xiaomi', '小米 MIX 3', 'phone'];
  MODELS['MI NOTE'] = ['xiaomi', '小米 Note', 'phone'];
  MODELS['MI NOTE 2'] = ['xiaomi', '小米 Note 2', 'phone'];
  MODELS['MI NOTE 3'] = ['xiaomi', '小米 Note 3', 'phone'];
  MODELS['MI NOTE 10'] = ['xiaomi', '小米 Note 10', 'phone'];
  MODELS['MI 8 LITE'] = ['xiaomi', '小米 8 青春版', 'phone'];
  MODELS['MI 9 LITE'] = ['xiaomi', '小米 9 Lite', 'phone'];
  MODELS['MI 9T'] = ['xiaomi', '小米 9T', 'phone'];
  MODELS['MI 9T Pro'] = ['xiaomi', '小米 9T Pro', 'phone'];
  MODELS['MI A1'] = ['xiaomi', '小米 A1', 'phone'];
 [' ['xiaomi', '小米 A2', 'phone'];
  MODELS['MI A3'] = ['xiaomi', '小米 A3', 'phone'];
  MODELS['MI 10T'] = ['xiaomi', '小米 10T', 'phone'];
  MODELS['MI 10T LITE'] = ['xiaomi', '小米 10T Lite', 'phone'];
  MODELS['MI 10T PRO'] = ['xiaomi', '小米 10T Pro', 'phone'];
  MODELS['MI 10 LITE'] = ['xiaomi', '小米 10 Lite', 'phone'];
  MODELS['MI 11 LITE'] = ['xiaomi', '小米 11 Lite', 'phone'];
  MODELS['MI 11 ULTRA'] = ['xiaomi', '小米 11 Ultra', 'phone'];
  MODELS['MI 12'] = ['xiaomi', '小米 12', 'phone'];
  MODELS['MI 12 PRO'] = ['xiaomi', '小米 12 Pro', 'phone'];
  MODELS['MI 12X'] = ['xiaomi', '小米 12X', 'phone'];
  MODELS['MI 12S'] = ['xiaomi', '小米 12S', 'phone'];
  MODELS['MI 12S PRO'] = ['xiaomi', '小米 12S Pro', 'phone'];
  MODELS['MI 12S ULTRA'] = ['xiaomi', '小米 12S Ultra', 'phone'];
  MODELS['MI 12T'] = ['xiaomi', '小米 12T', 'phone'];
  MODELS['MI 12T PRO'] = ['xiaomi', '小米 12T Pro', 'phone'];
  MODELS['XIAOMI 13'] = ['xiaomi', '小米 13', 'phone'];
  MODELS['XIAOMI 13 PRO'] = ['xiaomi', '小米 13 Pro', 'phone'];
  MODELS['XIAOMI 13 ULTRA'] = ['xiaomi', '小米 13 Ultra', 'phone'];
  MODELS['XIAOMI 13T'] = ['xiaomi', '小米 13T', 'phone'];
  MODELS['XIAOMI 13T PRO'] = ['xiaomi', '小米 13T Pro', 'phone'];
  MODELS['XIAOMI 14'] = ['xiaomi', '小米 14', 'phone'];
  MODELS['XIAOMI 14 PRO'] = ['xiaomi', '小米 14 Pro', 'phone'];
  MODELS['XIAOMI 14 ULTRA'] = ['xiaomi', '小米 14 Ultra', 'phone'];
  MODELS['XIAOMI 14T'] = ['xiaomi', '小米 14T', 'phone'];
  MODELS['XIAOMI 14T PRO'] = ['xiaomi', '小米 14T Pro', 'phone'];
  MODELS['XIAOMI 15'] = ['xiaomi', '小米 15', 'phone'];
  MODELS['XIAOMI 15 PRO'] = ['xiaomi', '小米 15 Pro', 'phone'];
  MODELS['XIAOMI 15 ULTRA'] = ['xiaomi', '小米 15 Ultra', 'phone'];
  MODELS['XIAOMI 15T'] = ['xiaomi', '小米 15T', 'phone'];
  MODELS['XIAOMI 15T PRO'] = ['xiaomi', '小米 15T Pro', 'phone'];
  MODELS['XIAOMI MIX 4'] = ['xiaomi', '小米 MIX 4', 'phone'];
  MODELS['XIAOMI MIX FOLD'] = ['xiaomi', '小米 MIX FOLD', 'phone'];
  MODELS['XIAOMI MIX FOLD 2'] = ['xiaomi', '小米 MIX Fold 2', 'phone'];
  MODELS['XIAOMI MIX FOLD 3'] = ['xiaomi', '小米 MIX Fold 3', 'phone'];
  MODELS['XIAOMI MIX FOLD 4'] = ['xiaomi', '小米 MIX Fold 4', 'phone'];
  MODELS['XIAOMI CIVI'] = ['xiaomi', '小米 Civi', 'phone'];
  MODELS['XIAOMI 12 LITE'] = ['xiaomi', '小米 12 Lite', 'phone'];
  MODELS['XIAOMI PAD 5'] = ['xiaomi', '小米平板 5', 'tablet'];
  MODELS['XIAOMI PAD 5 PRO'] = ['xiaomi', '小米平板 5 Pro', 'tablet'];
  MODELS['XIAOMI PAD 6'] = ['xiaomi', '小米平板 6', 'tablet'];
  MODELS['XIAOMI PAD 6 PRO'] = ['xiaomi', '小米平板 6 Pro', 'tablet'];
  MODELS['XIAOMI PAD 7'] = ['xiaomi', '小米平板 7', 'tablet'];
  MODELS['XIAOMI PAD 7 PRO'] = ['xiaomi', '小米平板 7 Pro', 'tablet'];
  MODELS['XIAOMI PAD 8'] = ['xiaomi', '小米平板 8', 'tablet'];

  // Redmi
  MODELS['REDMI 1'] = ['redmi', '红米手机', 'phone'];
  MODELS['REDMI 1S'] = ['redmi', '红米 1S', 'phone'];
  MODELS['REDMI 2'] = ['redmi', '红米 2', 'phone'];
  MODELS['REDMI 2A'] = ['redmi', '红米 2A', 'phone'];
  MODELS['REDMI 3'] = ['redmi', '红米 3', 'phone'];
  MODELS['REDMI 3S'] = ['redmi', '红米 3S', 'phone'];
  MODELS['REDMI 4'] = ['redmi', '红米 4', 'phone'];
  MODELS['REDMI 4A'] = ['redmi', '红米 4A', 'phone'];
  MODELS['REDMI 4X'] = ['redmi', '红米 4X', 'phone'];
  MODELS['REDMI 5'] = ['redmi', '红米 5', 'phone'];
  MODELS['REDMI 5 PLUS'] = ['redmi', '红米 5 Plus', 'phone'];
  MODELS['REDMI 5A'] = ['redmi', '红米 ',', 'phone'];
  MODELS['REDMI 6A'] = ['redmi', '红米 6A', 'phone'];
  MODELS['REDMI 7'] = ['redmi', '红米 7', 'phone'];
  MODELS['REDMI 7A'] = ['redmi', '红米 7A', 'phone'];
  MODELS['REDMI 8'] = ['redmi', '红米 8', 'phone'];
  MODELS['REDMI 8A'] = ['redmi', '红米 8A', 'phone'];
  MODELS['REDMI 9'] = ['redmi', '红米 9', 'phone'];
  MODELS['REDMI 9A'] = ['redmi', '红米 9A', 'phone'];
  MODELS['REDMI 9C'] = ['redmi', '红米 9C', 'phone'];
  MODELS['REDMI 9T'] = ['redmi', '红米 9T', 'phone'];
  MODELS['REDMI 10'] = ['redmi', '红米 10', 'phone'];
  MODELS['REDMI 10A'] = ['redmi', '红米 10A', 'phone'];
  MODELS['REDMI 10C'] = ['redmi', '红米 10C', 'phone'];
  MODELS['REDMI 12'] = ['redmi', '红米 12', 'phone'];
  MODELS['REDMI 12C'] = ['redmi', '红米 12C', 'phone'];
  MODELS['REDMI 13C'] = ['redmi', '红米 13C', 'phone'];
  MODELS['REDMI 14C'] = ['redmi', '红米 14C', 'phone'];
  MODELS['REDMI 15'] = ['redmi', '红米 15', 'phone'];
  MODELS['REDMI NOTE'] = ['redmi', '红米 Note', 'phone'];
  MODELS['REDMI NOTE 2'] = ['redmi', '红米 Note 2', 'phone'];
  MOD 3'] = ['redmi', '红米 Note 3', 'phone'];
  MODELS['REDMI NOTE 4'] = ['redmi', '红米 Note 4', 'phone'];
  MODELS['REDMI NOTE 5'] = ['redmi', '红米 Note 5', 'phone'];
  MODELS['REDMI NOTE 7'] = ['redmi', '红米 Note 7', 'phone'];
  MODELS['REDMI NOTE 8'] = ['redmi', '红米 Note 8', 'phone'];
  MODELS['REDMI NOTE 8 PRO'] = ['redmi', '红米 Note 8 Pro', 'phone'];
  MODELS['REDMI NOTE 9'] = ['redmi',['REDMI NOTE 10'] = ['redmi', '红米 Note 10', 'phone'];
  MODELS['REDMI NOTE 11'] = ['redmi', '红米 Note 11', 'phone'];
  MODELS['REDMI NOTE 12'] = ['redmi', '红米 Note 12', 'phone'];
  MODELS['REDMI NOTE 13'] = ['redmi', '红米 Note 13', 'phone'];
  MODELS['REDMI NOTE 14'] = ['redmi', '红米 Note 14', 'phone'];
  MODELS['REDMI NOTE 15'] = ['redmi', '红米 Note 15', 'phone'];
  MODELS['REDMI K20'] = ['redmi', '红米 K20', 'phone'];
  MODELS['REDMI K20 PRO'] = ['redmi', '红米 K20 Pro', 'phone'];
  MODELS['REDMI K30'] = ['redmi', '红米 K30', 'phone'];
  MODELS['REDMI K30 PRO'] = ['redmi', '红米 K30 Pro', 'phone'];
  MODELS['REDMI K40'] = ['redmi', '红米 K40', 'phone'];
  MODELS['REDMI K40 PRO'] = ['redmi', '红米 K40 Pro', 'phone'];
  MODELS['RED', '红米 K50', 'phone'];
  MODELS['REDMI K50 PRO'] = ['redmi', '红米 K50 Pro', 'phone'];
  MODELS['REDMI K60'] = ['redmi', '红米 K60', 'phone'];
  MODELS['REDMI K60 PRO'] = ['redmi', '红米 K60 Pro', 'phone'];
  MODELS['REDMI K70'] = ['redmi', '红米 K70', 'phone'];
  MODELS['REDMI K70 PRO'] = ['redmi', '红米 K70 Pro', 'phone'];
  MODELS['REDMI K80'] = ['redmi', '红米 K80', 'phone'];
  MODELS['REDMI K80 PRO'] = ['redmi', '红米 K80 Pro', 'phone'];
  MODELS['REDMI K90'] = ['redmi', '红米 K90', 'phone'];
  MODELS['REDMI TURBO 3'] = ['redmi', '红米 Turbo 3', 'phone'];
  MODELS['REDMI TURBO 4'] = ['redmi', '红米 Turbo 4', 'phone'];
  MODELS['REDMI TURBO 5'] = ['redmi', '红米 Turbo 5', 'phone'];
  MODELS['REDMI PAD'] = ['redmi', '红米平板', 'tablet'];
  MODELS['REDMI PAD SE'] = ['redmi', '红米平板 SE', 'tablet'];
  MODELS['REDMI PAD PRO'] = ['redmi', '红米平板 Pro', 'tablet'];
  MODELS['REDMI PAD 2'] = ['redmi', '红米平板 2', 'tablet'];

  // POCO
  MODELS['POCO F1'] = ['poco', 'POCO F1', 'phone'];
  MODELS['POCO F2 PRO'] = ['poco', 'POCO F2 Pro', 'phone'];
  MODELS['POCO F3'] = ['poco', 'POCO F3', 'phone'];
  MODELS['POCO F4'] = ['poco', 'POCO F4', 'phone'];
  MODELS['POCO F5'] = ['poco', 'POCO F5', 'phone'];
  MODELS['POCO F5 PRO'] = ['poco', 'POCO F5 Pro', 'phone'];
  MODELS['POCO F6'] = ['poco', 'POCO F6', 'phone'];
  MODELS['POCO F7'] = ['poco', 'POCO F7', 'phone'];
  MODELS['POCO F7 PRO'] = ['poco', 'POCO F7 Pro', 'phone'];
  MODELS['POCO F7 ULTRA'] = ['poco', 'POCO F7 Ultra', 'phone'];
  MODELS['POCO X3'] = ['poco', 'POCO X3', 'phone'];
  MODELS['POCO X3 PRO'] = ['poco', 'POCO X3 Pro', 'phone'];
  MODELS['POCO X4 PRO'] = ['poco', 'POCO X4 Pro', 'phone'];
  MODELS['POCO X5 PRO'] = ['poco', 'POCO X5 Pro', 'phone'];
  MODELS['POCO X6'] = ['poco', 'POCO X6', 'phone'];
  MODELS['POCO X6 PRO'] = ['poco', 'POCO X6 Pro', 'phone'];
  MODELS['POCO X7'] = ['poco', 'POCO X7', 'phone'];
  MODELS['POCO X7 PRO'] = ['poco', 'POCO X7 Pro', 'phone'];
  MODELS['POCO M3'] = ['poco', 'POCO M3', 'phone'];
  MODELS['POCO M4 PRO'] = ['poco', 'POCO M4 Pro', 'phone'];
  MODELS['POCO M5'] = ['poco', 'POCO M5', 'phone'];
  MODELS['POCO M6'] = ['poco', 'POCO M6', 'phone'];
  MODELS['POCO C65'] = ['poco', 'POCO C65', 'phone'];

  // ═══════════════════════════
  //  Huawei (华为)
  // ═══════════════════════════
  MODELS['HUAWEI P20'] = ['huawei', '华为 P20', 'phone'];
  MODELS['HUAWEI P20 PRO'] = ['huawei', '华为 P20 Pro', 'phone'];
  MODELS['HUAWEI P30'] = ['huawei', '华为 P30', 'phone'];
  MODELS['HUAWEI P30 PRO'] = ['huawei', '华为 P30 Pro', 'phone'];
  MODELS['HUAWEI P40'] = ['huawei', '华为 P40', 'phone'];
  MODELS['HUAWEI P40 PRO'] = ['huawei', '华为 P40 Pro', 'phone'];
  MODELS['HUAWEI P50'] = ['huawei', '华为 P50', 'phone'];
  MODELS['HUAWEI P50 PRO'] = ['huawei', '华为 P50 Pro', 'phone'];
  MODELS['HUAWEI P60'] = ['huawei', '华为 P60', 'phone'];
  MODELS['HUAWEI P60 PRO'] = ['huawei', '华为 P60 Pro', 'phone'];
  MODELS['HUAWEI MATE 20'] = ['huawei', '华为 Mate 20', 'phone'];
  MODELS['HUAWEI MATE 20 PRO'] = ['huawei', '华为 Mate 20 Pro', 'phone'];
  MODELS['HUAWEI MATE 30'] = ['huawei', '华为 Mate 30', 'phone'];
  MODELS['HUAWEI MATE 30 PRO'] = ['huawei', '华为 Mate 30 Pro', 'phone'];
  MODELS['HUAWEI MATE 40'] = ['huawei', '华为 Mate 40', 'phone'];
  MODELS['HUAWEI MATE 40 PRO'] = ['huawei', '华为 Mate 40 Pro', 'phone'];
  MODELS['HUAWEI MATE 50'] = ['huawei', '华为 Mate 50', 'phone'];
  MODELS['HUAWEI MATE 50 PRO'] = ['huawei', '华为 Mate 50 Pro', 'phone'];
  MODELS['HUAWEI MATE 60'] = ['huawei', '华为 Mate 60', 'phone'];
  MODELS['HUAWEI MATE 60 PRO'] = ['huawei', '华为 Mate 60 Pro', 'phone'];
  MODELS['HUAWEI MATE 70'] = ['huawei', '华为 Mate 70', 'phone'];
  MODELS['HUAWEI MATE 70 PRO'] = ['huawei', '华为 Mate 70 Pro', 'phone'];
  MODELS['HUAWEI MATE 80'] = ['huawei', '华为 Mate 80', 'phone'];
  MODELS['HUAWEI MATE 80 PRO'] = ['huawei', '华为 Mate 80 Pro', 'phone'];
  MODELS['HUAWEI NOVA 9'] = ['huawei', '华为 nova 9', 'phone'];
  MODELS['HUAWEI NOVA 10'] = ['huawei', '华为 nova VA 11'] = ['huawei', '华为 nova 11', 'phone'];
  MODELS['HUAWEI NOVA 12'] = ['huawei', '华为 nova 12', 'phone'];
  MODELS['HUAWEI NOVA 13'] = ['huawei', '华为 nova 13', 'phone'];
  MODELS['HUAWEI NOVA 14'] = ['huawei', '华为 nova 14', 'phone'];
  MODELS['HUAWEI MATEPAD PRO'] = ['huawei', '华为 MatePad Pro', 'tablet'];
  MODELS['HUAWEI MATEPAD 11'] = ['huawei', '华为 MatePad 11', 'tablet'];
  MODELS['HUAWEI WATCH GT'] = ['huawei', '华为 Watch GT', 'watch'];
  MODELS['HUAWEI WATCH GT 2'] = ['huawei', '华为 Watch GT 2', 'watch'];
  MODELS['HUAWEI WATCH GT 3'] = ['huawei', '华为 Watch GT 3', 'watch'];

  // ═══════════════════════════
  //  Honor (荣耀)
  // ═══════════════════════════
  MODELS['HONOR 9'] = ['honor', '荣耀 9', 'phone'];
  MODELS['HONOR 10'] = ['honor', '荣耀 10', 'phone'];
  MODELS['HONOR 20'] = ['honor', '荣耀 20', 'phone'];
  MODELS['HONOR 30'] = ['honor', '荣耀 30', 'phone'];
  MODELS['HONOR 50'] = ['honor', '荣耀 50', 'phone'];
  MODELS['HONOR 60'] = ['honor', '荣耀 60', 'phone'];
  MODELS['HONOR 70'] = ['honor', '荣耀 70', 'phone'];
  MODELS['HONOR 80'] = ['honor', '荣耀 80', 'phone'];
  MODELS['HONOR 90'] = ['honor', '荣耀 90', 'phone'];
  MODELS['HONOR 100'] = ['honor', '荣耀 100', 'phone'];
  MODELS['HONOR 200'] = ['honor', '荣耀 200', 'phone'];
  MODELS['HONOR 300'] = ['honor', '荣耀 300', 'phone'];
  MODELS['HONOR 400'] = ['honor', '荣耀 400', 'phone'];
  MODELS['HONOR MAGIC V'] = ['honor', '荣耀 Magic V', 'phone'];
  MODELS['HONOR MAGIC VS'] = ['honor', '荣耀 Magic Vs', 'phone'];
  MODELS['HONOR MAGIC V2'] = ['honor', '荣耀 Magic V2', 'phone'];
  MODELS['HONOR MAGIC V3'] = ['honor', '荣耀 Magic V3', 'phone'];
  MODELS['HONOR MAGIC4'] = ['honor', '荣耀 Magic4', 'phone'];
  MODELS['HONOR MAGIC5'] = ['honor', '荣耀 Magic5', 'phone'];
  MODELS['HONOR MAGIC6'] = ['honor', '荣耀 Magic6', 'phone'];
  MODELS['HONOR MAGIC7'] = ['honor', '荣耀 Magic7', 'phone'];
  MODELS['HONOR PAD 9'] = ['honor', '荣耀平板 9', 'tablet'];

  // ═══════════════════════════
  //  Samsung (三星)
  // ═══════════════════════════
  MODELS['SM-GALAXY S'] = ['samsung', 'Galaxy S', 'phone'];
  MODELS['SM-GALAXY S2'] = ['samsung', 'Galaxy S II', 'phone'];
  MODELS['SM-GALAXY S3'] = ['samsung', 'Galaxy S III', 'phoneELS Sphone'];
  MODELS['SM-GALAXY S5'] = ['samsung', 'Galaxy S5', 'phone'];
  MODELS['SM-GALAXY S6'] = ['samsung', 'Galaxy S6', 'phone'];
  MODELS['SM-GALAXY S7'] = ['samsung', 'Galaxy S7', 'phone'];
  MODELS['SM-GALAXY S8'] = ['samsung', 'Galaxy S8', 'phone'];
  MODELS['SM-GALAXY S9'] = ['samsung', 'Galaxy S9', 'phone'];
  MODELS['SM-GALAXY S10'] = ['samsung', 'Galaxy S10', 'phone'];
  MODELS['SM-GALAXY S20'] = ['samsung', 'Galaxy S20', 'phone'];
  MODELS['SM-GALAXY S21'] = ['samsung', 'Galaxy S21', 'phone'];
  MODELS['SM-GALAXY S22'] = ['samsung', 'Galaxy S22', 'phone'];
  MODELS['SM-GALAXY S23'] = ['samsung', 'Galaxy S23', 'phone'];
  MODELS['SM-GALAXY S24'] = ['samsung', 'Galaxy S24', 'phone'];
  MODELS['SM-GALAXY S25'] = ['samsung', 'Galaxy S25', 'phone'];
  MODELS['SM-GALAXY S26'] = ['samsung', 'Galaxy S26', 'phone'];
  MODELS['SM-NOTE'] = ['samsung', 'Galaxy Note', 'phone'];
  MODELS['SM-GALAXY NOTE 3'] = ['samsung', 'Galaxy Note 3', 'phone'];
  MODELS['SM-GALAXY NOTE 4'] = ['samsung', 'Galaxy Note 4', 'phone'];
  MODELS['SM-GALAXY NOTE 5'] = ['samsung', 'Galaxy Note 5', 'phone'];
  MODELS['SM-NOTE7'] = ['samsung', 'Galaxy Note 7', 'phone'];
  MODELS['SM-GALAXY NOTE 8'] = ['samsung', 'Galaxy Note 8', 'phone'];
  MODELS['SM-GALAXY NOTE 9'] = ['samsung', 'Galaxy Note 9', 'phone'];
  MODELS['SM-NOTE10'] = ['samsung', 'Galaxy Note 10', 'phone'];
  MODELS['SM-NOTE20'] = ['samsung', 'Galaxy Note 20', 'phone'];
  MODELS['SM-Z FOLD'] = ['samsung', 'Galaxy Z Fold', 'phone'];
  MODELS['SM-Z FOLD2'] = ['samsung', 'Galaxy Z Fold 2', 'phone'];
  MODELS['SM-Z FOLD3'] = ['samsung', 'Galaxy Z Fold 3', 'phone'];
  MODELS['SM-Z FOLD4'] = ['samsung', 'Galaxy Z Fold 4', 'phone'];
  MODELS['SM-Z FOLD5'] = ['samsung', 'Galaxy Z Fold 5', 'phone'];
  MODELS['SM-Z FOLD6'] = ['samsung', 'Galaxy Z Fold 6', 'phone'];
  MODELS['SM-Z FOLD7'] = ['samsung', 'Galaxy Z Fold 7', 'phone'];
ELSSM-Z FLIP'] = ['samsung', 'Galaxy Z Flip', 'phone'];
  MODELS['SM-Z FLIP3'] = ['samsung', 'Galaxy Z Flip 3', 'phone'];
  MODELS['SM-Z FLIP4'] = ['samsung', 'Galaxy Z Flip 4', 'phone'];
  MODELS['SM-Z FLIP5'] = ['samsung', 'Galaxy Z Flip 5', 'phone'];
  MODELS['SM-Z FLIP6'] = ['samsung', 'Galaxy Z Flip 6', 'phone'];
  MODELS['SM-Z FLIP7'] = ['samsung', 'Galaxy Z Flip 7', 'phone'];
  MODELS['SM-GALAXY WATCH4'] = ['samsung', 'Galaxy Watch4', 'watch'];
  MODELS['SM-GALAXY WATCH5'] = ['samsung', 'Galaxy Watch5', 'watch'];
  MODELS['SM-GALAXY WATCH6'] = ['samsung', 'Galaxy Watch6', 'watch'];
  MODELS['SM-GALAXY WATCH7'] = ['samsung', 'Galaxy Watch7', 'watch'];
  MODELS['SM-GALAXY WATCH ULTRA'] = ['samsung', 'Galaxy Watch Ultra', 'watch'];
  MODELS['SM-GALAXY TAB S'] = ['samsung', 'Galaxy Tab S', 'tablet'];
  MODELS['SM-GALAXY TAB S6'] = ['samsung', 'Galaxy Tab S6', 'tablet'];
  MODELS['SM-GALAXY TAB S7'] = ['samsung', 'Galaxy Tab S7', 'tablet'];
  MODELS['SM-GALAXY TAB S8'] = ['samsung', 'Galaxy Tab S8', 'tablet'];
  MODELS['SM-GALAXY TAB S9'] = ['samsung', 'Galaxy Tab S9', 'tablet'];
  MODELS['SM-GALAXY TAB A'] = ['samsung', 'Galaxy Tab A', 'tablet'];

  // ═══════════════════════════
  //  OnePlus (一加) - 型号代码映射
  // ═══════════════════════════
  MODELS['ONE A'] = ['oneplus', '一加手机', 'phone'];
  MODELS['ONE E'] = ['oneplus', '一加手机 X', 'phone'];
  MODELS['ONEPLUS A'] = ['oneplus', '一加手机', 'phone'];
  MODELS['GM190'] = ['oneplus', '一加 7', 'phone'];
  MODELS['GM191'] = ['oneplus', '一加 7 Pro', 'phone'];
  MODELS['GM192'] = ['oneplus', '一加 7 Pro 5G', 'phone'];
  MODELS['HD190'] = ['oneplus', '一加 7T', 'phone'];
  MODELS['HD191'] = ['oneplus', '一加 7T Pro', 'phone'];
  MODELS['HD192'] = ['oneplus', '一加 7T Pro 5G', 'phone'];
  MODELS['IN201'] = ['oneplus', '一加 8', 'phone'];
  MODELS['IN202'] = ['oneplus', '一加 8 Pro', 'phone'];
  MODELS['KB200'] = ['oneplus', '一加 8T', 'phone'];
  MODELS['LE210'] = ['oneplus', '一加 9R', 'phone'];
  MODELS['LE211'] = ['oneplus', '一加 9', 'phone'];
  MODELS['LE212'] = ['oneplus', '一加 9 Pro', 'phone'];
  MODELS['MT211'] = ['oneplus', '一加 9RT', 'phone'];
  MODELS['NE221'] = ['oneplus', '一加 10 Pro', 'phone'];
  MODELS['PHB110'] = ['oneplus', '一加 11', 'phone'];
  MODELS['PHK110'] = ['oneplus', '一加 Ace 2', 'phone'];
  MODELS['PHP110'] = ['oneplus', '一加 Ace 2V', 'phone'];
  MODELS['PJA110'] = ['oneplus', '一加 Ace 2 Pro', 'phone'];
  MODELS['PJD110'] = ['oneplus', '一加 12', 'phone'];
  MODELS['PJE110'] = ['oneplus', '一加 Ace 3', 'phone'];
  MODELS['PJF110'] = ['oneplus', '一加 Ace 3V', 'phone'];
  MODELS['PJX110'] = ['oneplus', '一加 Ace 3 Pro', 'phone'];
  MODELS['PJZ110'] = ['oneplus', '一加 13', 'phone'];
  MODELS['PKG110'] = ['oneplus', '一加 Ace 5', 'phone'];
  MODELS['PKR110'] = ['oneplus', '一加 Ace 5 Pro', 'phone'];
  MODELS['PKX110'] = ['oneplus', '一加 13T', 'phone'];
  MODELS['PLK110'] = ['oneplus', '一加 15', 'phone'];
  MODELS['PLR110'] = ['oneplus', '一加 Ace 6T', 'phone'];
  MODELS['CPH2573'] = ['oneplus', '一加 12 (印)', 'phone'];
  MODELS['CPH2581'] = ['oneplus', '一加 12 (欧/国际)', 'phone'];
  MODELS['CPH2583'] = ['oneplus', '一加 12 (北美)', 'phone'];
  MODELS['CPH2649'] = ['oneplus', '一加 13 (印)', 'phone'];
  MODELS['CPH2653'] = ['oneplus', '一加 13 (欧/国际)', 'phone'];
  MODELS['CPH2655'] = ['oneplus', '一加 13 (北美)', 'phone'];
  MODELS['CPH2447'] = ['oneplus', '一加 11 (印)', 'phone'];
  MODELS['CPH2449'] = ['oneplus', '一加 11 (欧/国际)', 'phone'];
  MODELS['CPH2451'] = ['oneplus', '一加 11 (北美)', 'phone'];
  MODELS['CPH2423'] = ['oneplus', '一加 10R (印)', 'phone'];
  MODELS['CPH2413'] = ['oneplus', '一加 10T (印)', 'phone'];
  MODELS['CPH2415'] = ['oneplus', '一加 10T (欧/国际)', 'phone'];
  MODELS['CPH2417'] = ['oneplus', '一加 10T (北美)', 'phone'];
  MODELS['CPH2585'] = ['oneplus', '一加 12R (印)', 'phone'];
  MODELS['CPH2609'] = ['oneplus', '一加 12R (欧/国际)', 'phone'];
  MODELS['CPH2611'] = ['oneplus', '一加 12R (北美)', 'phone'];
  MODELS['CPH2551'] = ['oneplus', '一加 Open', 'phone'];

  // ═══════════════════════════
  //  OPPO
  // ═══════════════════════════
  MODELS['OPPO RENO'] = ['oppo', 'OPPO Reno', 'phone'];
  MODELS['OPPO RENO2'] = ['oppo', 'OPPO Reno 2', 'phone'];
  MODELS['OPPO RENO3'] = ['oppo', 'OPPO Reno 3', 'phone'];
  MODELS['OPPO RENO4'] = ['oppo', 'OPPO Reno 4', 'phone'];
  MODELS['OPPO RENO5'] = ['oppo', 'OPPO Reno 5', 'phone'];
  MODELS['OPPO RENO6'] = ['oppo', 'OPPO Reno 6', 'phone'];
  MODELS['OPPO RENO7'] = ['oppo', 'OPPO Reno 7', 'phone'];
  MODELS['OPPO RENO8'] = ['oppo', 'OPPO Reno 8', 'phone'];
  MODELS['OPPO RENO9'] = ['oppo', 'OPPO Reno 9', 'phone'];
  MODELS['OPPO RENO10'] = ['oppo', 'OPPO Reno 10', 'phone'];
  MODELS['OPPO RENO11'] = ['oppo', 'OPPO Reno 11', 'phone'];
  MODELS['OPPO RENO12'] = ['oppo', 'OPPO Reno 12', 'phone'];
  MODELS['OPPO RENO13'] = ['oppo', 'OPPO Reno 13', 'phone'];
  MODELS['OPPO FIND X'] = ['oppo', 'OPPO Find X', 'phone'];
  MODELS['OPPO FIND X2'] = ['oppo', 'OPPO Find X2', 'phone'];
  MODELS['OPPO FIND X3'] = ['oppo', 'OPPO Find X3', 'phone'];
  MODELS['OPPO FIND X5'] = ['oppo', 'OPPO Find X5', 'phone'];
  MODELS['OPPO FIND X6'] = ['oppo', 'OPPO Find X6', 'phone'];
  MODELS['OPPO FIND X7'] = ['oppo', 'OPPO Find X7', 'phone'];
  MODELS['OPPO FIND X8'] = ['oppo', 'OPPO Find X8', 'phone'];
  MODELS['OPPO FIND X9'] = ['oppo', 'OPPO Find X9', 'phone'];
  MODELS['OPPO FIND N'] = ['oppo', 'OPPO Find N', 'phone'];
  MODELS['OPPO FIND N2'] = ['oppo', 'OPPO Find N2', 'phone'];
  MODELS['OPPO FIND N3'] = ['oppo', 'OPPO Find N3', 'phone'];
  MODELS['OPPO FIND N5'] = ['oppo', 'OPPO Find N5', 'phone'];

  // ═══════════════════════════
  //  vivo & iQOO
  // ═══════════════════════════
  MODELS['VIVO X50'] = ['vivo', 'vivo X50', 'phone'];
  MODELS['VIVO X60'] = ['vivo', 'vivo X60', 'phone'];
  MODELS['VIVO X70'] = ['vivo', 'vivo X70', 'phone'];
  MODELS['VIVO X80'] = ['vivo', 'vivo X80', 'phone'];
  MODELS['VIVO X90'] = ['vivo', 'vivo X90', 'phone'];
  MODELS['VIVO X100'] = ['vivo', 'vivo X100', 'phone'];
  MODELS['VIVO X200'] = ['vivo', 'vivo X200', 'phone'];
  MODELS['VIVO X300'] = ['vivo', 'vivo X300', 'phone'];
  MODELS['VIVO X FOLD'] = ['vivo', 'vivo X Fold', 'phone'];
  MODELS['VIVO X FLIP'] = ['vivo', 'vivo X Flip', 'phone'];
  MODELS['IQOO'] = ['iqoo', 'iQOO', 'phone'];
  MODELS['IQOO 3'] = ['iqoo', 'iQOO 3', 'phone'];
  MODELS['IQOO 7'] = ['iqoo', 'iQOO 7', 'phone'];
  MODELS['IQOO 8'] = ['iqoo', 'iQOO 8', 'phone'];
  MODELS['IQOO 9'] = ['iqoo', 'iQOO 9', 'phone'];
  MODELS['IQOO 10'] = ['iqoo', 'iQOO 10', 'phone'];
  MODELS['IQOO 11'] = ['iqoo', 'iQOO 11', 'phone'];
  MODELS['IQOO 12'] = ['iqoo', 'iQOO 12', 'phone'];
  MODELS['IQOO 13'] = ['iqoo', 'iQOO 13', 'phone'];
  MODELS['IQOO 15'] = ['iqoo', 'iQOO 15', 'phone'];

  // ═══════════════════════════
  //  Google Pixel
  // ═══════════════════════════
  MODELS['PIXEL'] = ['google', 'Pixel', 'phone'];
  MODELS['PIXEL XL'] = ['google', 'Pixel XL', 'phone'];
  MODELS['PIXEL 2'] = ['google', 'Pixel 2', 'phone'];
  MODELS['PIXEL 2 XL'] = ['google', 'Pixel 2 XL', 'phone'];
  MODELS['PIXEL 3'] = ['google', 'Pixel 3', 'phone'];
  MODELS['PIXEL 3 XL'] = ['google', 'Pixel 3 XL', 'phone'];
  MODELS['PIXEL 3A'] = ['google', 'Pixel 3a', 'phone'];
  MODELS['PIXEL 4'] = ['google', 'Pixel 4', 'phone'];
  MODELS['PIXEL 4 XL'] = ['google', 'Pixel 4 XL', 'phone'];
  MODELS['PIXEL 4A'] = ['google', 'Pixel 4a', 'phone'];
  MODELS['PIXEL 5'] = ['google', 'Pixel 5', 'phone'];
  MODELS['PIXEL 5A'] = ['google', 'Pixel 5a', 'phone'];
  MODELS['PIXEL 6'] = ['google', 'Pixel 6', 'phone'];
  MODELS['PIXEL 6 PRO'] = ['google', 'Pixel 6 Pro', 'phone'];
  MODELS['PIXEL 6A'] = ['google', 'Pixel 6a', 'phone'];
  MODELS['PIXEL 7'] = ['google', 'Pixel 7', 'phone'];
  MODELS['PIXEL 7 PRO'] = ['google', 'Pixel 7 Pro', 'phone'];
  MODELS['PIXEL 7A'] = ['google', 'Pixel 7a', 'phone'];
  MODELS['PIXEL 8'] = ['google', 'Pixel 8', 'phone'];
  MODELS['PIXEL 8 PRO'] = ['google', 'Pixel 8 Pro', 'phone'];
  MODELS['PIXEL 8A'] = ['google', 'Pixel 8a', 'phone'];
  MODELS['PIXEL 9'] = ['google', 'Pixel 9', 'phone'];
  MODELS['PIXEL 9 PRO'] = ['google', 'Pixel 9 Pro', 'phone'];
  MODIXgoogle', 'Pixel 9 Pro XL', 'phone'];
  MODELS['PIXEL 9A'] = ['google', 'Pixel 9a', 'phone'];
  MODELS['PIXEL 10'] = ['google', 'Pixel 10', 'phone'];
  MODELS['PIXEL 10 PRO'] = ['google', 'Pixel 10 Pro', 'phone'];
  MODELS['PIXEL FOLD'] = ['google', 'Pixel Fold', 'phone'];
  MODELS['PIXEL WATCH'] = ['google', 'Pixel Watch', 'watch'];

  // ═══════════════════════════
  //  realme (真我)
  // ═══════════════════════════
  MODELS['RMX190'] = ['realme', '真我 X', 'phone'];
  MODELS['RMX193'] = ['realme', '真我 X2 Pro', 'phone'];
  MODELS['RMX199'] = ['realme', '真我 X2', 'phone'];
  MODELS['RMX212'] = ['realme', '真我 X7 Pro', 'phone'];
  MODELS['RMX214'] = ['realme', '真我 X50', 'phone'];
  MODELS['RMX217'] = ['realme', '真我 X7', 'phone'];
  MODELS['RMX220'] = ['realme', '真我 GT', 'phone'];
  MODELS['RMX2202'] = ['realme', '真我 Q2', 'phone'];
  MODELS['RMX331'] = ['realme', '真我 GT2', 'phone'];
  MODELS['RMX330'] = ['realme', '真我 GT2 Pro', 'phone'];
  MODELS['RMX336'] = ['realme', '真我 GT 大师探索版', 'phone'];
  MODELS['RMX337'] = ['realme', '真我 GT Neo2', 'phone'];
  MODELS['RMX346'] = ['realme', '真我 Q3s', 'phone'];
  MODELS['RMX356'] = ['realme', '真我 GT Neo3', 'phone'];
  MODELS['RMX361'] = ['realme', '真我 V20', 'phone'];
  MODELS['RMX368'] = ['realme', '真我 10 Pro+', 'phone'];
  MODELS['RMX370'] = ['realme', '真我 GT Neo5', 'phone'];
  MODELS['RMX374'] = ['realme', '真我 11 Pro+', 'phone'];
  MODELS['RMX376'] = ['realme', '真我 C53', 'phone'];
  MODELS['RMX378'] =真11', 'phone'];
  MODELS['RMX380'] = ['realme', '真我 GT6', 'phone'];
  MODELS['RMX382'] = ['realme', '真我 GT5', 'phone'];
  MODELS['RMX384'] = ['realme', '真我 12 Pro+',[' GT = ['realme', '真我 GT5 Pro', 'phone'];
  MODELS['RMX392'] = ['realme', '真我 13 Pro+', 'phone'];
  MODELS['RMX394'] = ['realme', '真我 14x', 'phone'];
  MODELS['RMX399'] = ['realme', '真我 12 5G', 'phone'];
  MODELS['RMX500'] = ['realme', '真我 13+', 'phone'];
  MODELS['RMX501'] = ['realme', '真我 GT7 Pro', 'phone'];
  MODELS['RMX505'] = ['realme', '真我 14 Pro+', 'phone'];
  MODELS['RMX506'] = ['realme', '真我 Neo7', 'phone'];
  MODELS['RMX507'] = ['realme', '真我 Neo7x', 'phone'];
  MODELS['RMX508'] = ['realme', '真我 Neo7 SE', 'phone'];
  MODELS['RMX509'] = ['realme', '真我 GT7 Pro 竞速版', 'phone'];
  MODELS['RMX510'] = ['realme', '真我 15 Pro', 'phone'];
  MODELS['RMX511'] = ['realme', '真我 15T', 'phone'];
  MODELS['RMX520'] = ['realme', '真我 GT8 Pro', 'phone'];
  MODELS['RMX668'] = ['realme', '真我 GT7', 'phone'];
  MODELS['RMX889'] = ['realme', '真我 Neo8', 'phone'];

  // ═══════════════════════════
  //  一加/OPPO 共用 CPH 前缀
  // ═══════════════════════════
  // CPH 开头的型号，先匹配 OPPO 再匹配一加 Nord

  // ═══════════════════════════
  //  Meizu (魅族)
  // ═══════════════════════════
  MODELS['MEIZU 15'] = ['meizu', '魅族 15', 'phone'];
  MODELS['MEIZU 16'] = ['meizu', '魅族 16th', 'phone'];
  MODELS['MEIZU 16S'] = ['meizu', '魅族 16s', 'phone'];
  MODELS['MEIZU 16T'] = ['meizu', '魅族 16T', 'phone'];
  MODELS['MEIZU 17'] = ['meizu', '魅族 17', 'phone'];
  MODELS['MEIZU 18'] = ['meizu', '魅族 18', 'phone'];
  MODELS['MEIZU 20'] = ['meizu', '魅族 20', 'phone'];
  MODELS['MEIZU 21'] = ['meizu', '魅族 21', 'phone'];
  MODELS['MEIZU 22'] = ['meizu', '魅族 22', 'phone'];

  // ═══════════════════════════
  //  Sony (索尼)
  // ═══════════════════════════
  MODELS['XPERIA XZ'] = ['sony', 'Xperia XZ', 'phone'];
  MODELS['XPERIA XZ1'] = ['sony', 'Xperia XZ1', 'phone'];
  MODELS['XPERIA XZ2'] = ['sony', 'Xperia XZ2', 'phone'];
  MODELS['XPERIA XZ3'] = ['sony', 'Xperia XZ3', 'phone'];
  MODELS['XPERIA 1'] = ['sony', 'Xperia 1', 'phone'];
  MODELS['XPERIA 5'] = ['sony', 'Xperia 5', 'phone'];
  MODELS['XPERIA 10'] = ['sony', 'Xperia 10', 'phone'];
  MODELS['XPERIA L'] = ['sony', 'Xperia L', 'phone'];

  // ═══════════════════════════
  //  ASUS (华硕)
  // ═══════════════════════════
  MODELS['ASUS ZENFONE'] = ['asus', 'ZenFone', 'phone'];
  MODELS['ASUS ROG PHONE'] = ['asus', 'ROG Phone', 'phone'];
  MODELS['ASUS ROG PHONE 2'] = ['asus', 'ROG Phone 2', 'phone'];
  MODELS['ASUS ROG PHONE 3'] = ['asus', 'ROG Phone 3', 'phone'];
  MODELS['ASUS ROG PHONE 5'] = ['asus', 'ROG Phone 5', 'phone'];
  MODELS['ASUS ROG PHONE 6'] = ['asus', 'ROG Phone 6', 'phone'];
  MODELS['ASUS ROG PHONE 7'] = ['asus', 'ROG Phone 7', 'phone'];
  MODELS['ASUS ROG PHONE 8'] = ['asus', 'ROG Phone 8', 'phone'];
  MODELS['ASUS ROG PHONE 9'] = ['asus', 'ROG Phone 9', 'phone'];

  // ═══════════════════════════
  //  Nothing
  // ═══════════════════════════
  MODELS['NOTHING PHONE (1)'] = ['nothing', 'Nothing Phone (1)', 'phone'];
  MODELS['NOTHING PHONE (2)'] = ['nothing', 'Nothing Phone (2)', 'phone'];
  MODELS['NOTHING PHONE (2A)'] = ['nothing', 'Nothing Phone (2a)', 'phone'];
  MODELS['NOTHING PHONE (3)'] = ['nothing', 'Nothing Phone (3)', 'phone'];
  MODELS['NOTHING PHONE (3A)'] = ['nothing', 'Nothing Phone (3a)', 'phone'];

  // ═══════════════════════════
  //  Nubia (努比亚) & 红魔
  // ═══════════════════════════
  MODELS['NX659'] = ['nubia', '红魔 5G', 'phone'];
  MODELS['NX669'] = ['nubia', '红魔 6', 'phone'];
  MODELS['NX679'] = ['nubia', '红魔 7', 'phone'];
  MODELS['NX709'] = ['nubia', '红魔 7 Pro', 'phone'];
  MODELS['NX729'] = ['nubia', '红魔 8 Pro', 'phone'];
  MODELS['NX769'] = ['nubia', '红魔 9 Pro', 'phone'];
  MODELS['NX789'] = ['nubia', '红魔 10 Pro', 'phone'];
  MODELS['NX809'] = ['nubia', '红魔 11 Pro', 'phone'];
  MODELS['NX721'] = ['nubia', '努比亚 Z60 Ultra', 'phone'];
  MODELS['NX733'] = ['nubia', '努比亚 Z70 Ultra', 'phone'];
  MODELS['NX741'] = ['nubia', '努比亚 Z80 Ultra', 'phone'];

  // ═══════════════════════════
  //  Motorola (摩托罗拉)
  // ═══════════════════════════
  MODELS['MOTO G'] = ['motorola', 'Moto G', 'phone'];
  MODELS['MOTO X'] = ['motorola', 'Moto X', 'phone'];
  MODELS['MOTO Z'] = ['motorola', 'Moto Z', 'phone'];
  MODELS['MOTO EDGE'] = ['motorola', 'Moto Edge', 'phone'];
  MODELS['MOTO RAZR'] = ['motorola', 'Moto Razr', 'phone'];
  MODELS['MOTO G50'] = ['motorola', 'Moto G50', 'phone'];
  MODELS['MOTO G51'] = ['motorola', 'Moto G51', 'phone'];
  MODELS['MOTO G53'] = ['motorola', 'Moto G53', 'phone'];
  MODELS['MOTO G54'] = ['motorola', 'Moto G54', 'phone'];
  MODELS['MOTO G55'] = ['motorola', 'Moto G55', 'phone'];
  MODELS['MOTO G75'] = ['motorola', 'Moto G75', 'phone'];
  MODELS['MOTO G100'] = ['motorola', 'Moto G100', 'phone'];
  MODELS['MOTO EDGE 30'] = ['motorola', 'Moto Edge 30', 'phone'];
  MODELS['MOTO EDGE 40'] = ['motorola', 'Moto Edge 40', 'phone'];
  MODELS['MOTO EDGE 50'] = ['motorola', 'Moto Edge 50', 'phone'];

  // ═══════════════════════════
  //  华为智选
  // ═══════════════════════════
  MODELS['HI NOVA'] = ['zhixuan', 'Hi nova', 'phone'];
  MODELS['TD TECH'] = ['zhixuan', '鼎桥', 'phone'];
  MODELS['WIKO'] = ['zhixuan', 'WIKO', 'phone'];

  // ── 查询工具函数 ──

  /** 根据型号代码查询设备信息 */
  function lookup(modelCode) {
    if (!modelCode || modelCode === '--') return null;
    var key = modelCode.toUpperCase().trim();
    // 精确匹配
    if (MODELS[key]) return format(MODELS[key], key);
    // 前缀匹配（按长度降序）
    var keys = Object.keys(MODELS).sort(function(a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      if (key.indexOf(keys[i]) === 0) {
        return format(MODELS[keys[i]], key);
      }
    }
    return null;
  }

  function format(data, code) {
    var brand = BRANDS[data[0]];
    return {
      brand: brand ? brand.zh : data[0],
      brandEn: brand ? brand.en : data[0],
      name: data[1],
      type: data[2],
      code: code
    };
  }

  /** 根据型号获取品牌中文名 */
  function getBrand(modelCode) {
    var info = lookup(modelCode);
    return info ? info.brand : null;
  }

  /** 获取所有品牌列表 */
  function getBrandList() {
    var list = [];
    for (var k in BRANDS) list.push(BRANDS[k].zh);
    return list;
  }

  return {
    lookup: lookup,
    getBrand: getBrand,
    getBrandList: getBrandList,
    BRANDS: BRANDS
  };
})();
