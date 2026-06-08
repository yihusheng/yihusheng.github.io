window.DeviceDB = function(){
var M={},B={xiaomi:'小米',redmi:'红米',poco:'POCO',huawei:'华为',honor:'荣耀',oneplus:'一加',oppo:'OPPO',realme:'真我',vivo:'vivo',iqoo:'iQOO',meizu:'魅族',lenovo:'联想',google:'谷歌',moto:'摩托罗拉',motorola:'摩托罗拉',nokia:'诺基亚',sony:'索尼',asus:'华硕',nothing:'Nothing',nubia:'努比亚',zte:'中兴',blackshark:'黑鲨',coolpad:'酷派',letv:'乐视','360':'360',tcl:'TCL',zhixuan:'华为智选',samsung:'三星',apple:'苹果'};
function a(b,m,t){M[b.toUpperCase()]=[b,m,t]}
// Apple iPhone
a('apple','iPhone','phone');['1,1','1,2','2,1','3,1','3,3','4,1','5,1','5,2','5,3','5,4','6,1','6,2','7,1','7,2','8,1','8,2','8,4','9,1','9,2','9,3','9,4','10,1','10,2','10,3','10,4','10,5','10,6','11,2','11,4','11,6','11,8','12,1','12,3','12,5','12,8','13,1','13,2','13,3','13,4','14,2','14,4','14,5','14,6','14,7','14,8','15,2','15,3','15,4','15,5','16,1','16,2','17,1','17,2','17,3','17,4','17,5','18,1','18,2','18,3','18,4','18,5'].forEach(function(v){a('iPhone'+v,'iPhone '+v.replace(/,/g,'/'),'phone')});
// iPad
[['1,1','iPad'],['2,1','iPad 2'],['3,1','iPad 3rd'],['3,4','iPad 4th'],['4,1','iPad Air'],['5,3','iPad Air 2'],['6,11','iPad 5th'],['7,5','iPad 6th'],['7,11','iPad 7th'],['11,6','iPad 8th'],['12,1','iPad 9th'],['13,18','iPad 10th'],['2,5','iPad mini'],['4,4','iPad mini 2'],['5,1','iPad mini 4'],['11,1','iPad mini 5th'],['14,1','iPad mini 6th'],['16,1','iPad mini A17'],['6,3','iPad Pro 9.7'],['6,7','iPad Pro 12.9'],['8,1','iPad Pro 11'],['8,5','iPad Pro 12.9 3rd'],['13,4','iPad Pro 11 3rd'],['13,8','iPad Pro 12.9 5th'],['16,3','iPad Pro 11 M4'],['16,5','iPad Pro 13 M4'],['17,1','iPad Pro 11 M5']].forEach(function(v){a('iPad'+v[0],v[1],'tablet')});
// Apple Watch
[['1,1','Watch 1st 38mm'],['2,3','Watch S2 38mm'],['3,1','Watch S3 38mm'],['4,1','Watch S4 40mm'],['5,1','Watch S5 40mm'],['6,1','Watch S6 40mm'],['6,6','Watch S7 41mm'],['6,14','Watch S8 41mm'],['6,18','Watch Ultra'],['7,1','Watch S9 41mm'],['7,5','Watch Ultra 2']].forEach(function(v){a('Watch'+v[0],v[1],'watch')});
// Xiaomi model codes (hardware codes like 24129PN74C)
[['24129PN74C','Xiaomi 15'],['2410DPN6CC','Xiaomi 15 Pro'],['25019PNF3C','Xiaomi 15 Ultra'],['25010PN30C','Xiaomi 15 Ultra 双卫星'],['25042PN24C','Xiaomi 15S Pro'],['23127PN0CC','Xiaomi 14'],['23116PN5BC','Xiaomi 14 Pro'],['2311BPN23C','Xiaomi 14 Pro 钛金属'],['24031PN0DC','Xiaomi 14 Ultra'],['2304FPN6DC','Xiaomi 13 Ultra'],['2211133C','Xiaomi 13'],['2210132C','Xiaomi 13 Pro'],['2201123C','Xiaomi 12'],['2201122C','Xiaomi 12 Pro'],['2112123AC','Xiaomi 12X'],['2206123SC','Xiaomi 12S'],['2206122SC','Xiaomi 12S Pro'],['2203121C','Xiaomi 12S Ultra'],['2106118C','Xiaomi MIX 4'],['22061218C','MIX Fold 2'],['2308CPXD0C','MIX Fold 3'],['24072PX77C','MIX Fold 4'],['2405CPX3DC','Xiaomi MIX Flip'],['2505APX7BC','Xiaomi MIX Flip 2'],['2109119BC','Xiaomi Civi'],['23046PNC9C','Xiaomi Civi 3'],['24053PY09C','Xiaomi Civi 4 Pro'],['2410CRP4CC','Xiaomi Pad 7'],['24091RPADC','Xiaomi Pad 7 Pro'],['25097RP43C','Xiaomi Pad 8']].forEach(function(v){a(v[0],v[1],'phone')});
// Xiaomi name-based
['MI 1','MI 2','MI 2S','MI 3','MI 4','MI 4C','MI 5','MI 5S','MI 6','MI 8','MI 9','MI 10','MI 10S','MI 10T','MI 10T PRO','MI 11','MI 11 LITE','MI 11 ULTRA','MI 12','MI 12 PRO','MI 12X','MI 12T'].forEach(function(v){a(v,'小米 '+v.slice(3),'phone')});
// Redmi name-based
['Redmi 1','Redmi 1S','Redmi 2','Redmi 2A','Redmi 3','Redmi 3S','Redmi 4','Redmi 4A','Redmi 4X','Redmi 5','Redmi 5A','Redmi 5 Plus','Redmi 6','Redmi 6A','Redmi 7','Redmi 7A','Redmi 8','Redmi 8A','Redmi 9','Redmi 9A','Redmi 9C','Redmi 9T','Redmi 10','Redmi 10A','Redmi 10C','Redmi 12','Redmi 12C','Redmi 13','Redmi 13C','Redmi 14','Redmi 14C','Redmi 15'].forEach(function(v){a(v,v,'phone')});
['Redmi Note','Redmi Note 2','Redmi Note 3','Redmi Note 4','Redmi Note 5','Redmi Note 7','Redmi Note 8','Redmi Note 8 Pro','Redmi Note 9','Redmi Note 10','Redmi Note 11','Redmi Note 12','Redmi Note 13','Redmi Note 14','Redmi Note 15','Redmi K20','Redmi K20 Pro','Redmi K30','Redmi K30 Pro','Redmi K40','Redmi K40 Pro','Redmi K50','Redmi K50 Pro','Redmi K60','Redmi K60 Pro','Redmi K70','Redmi K70 Pro','Redmi K80','Redmi K80 Pro','Redmi K90','Redmi Turbo 3','Redmi Turbo 4','Redmi Turbo 5'].forEach(function(v){a(v,'红米 '+v.slice(6),'phone')});
// Redmi Pad
['Redmi Pad','Redmi Pad SE','Redmi Pad Pro','Redmi Pad 2','Redmi Pad 2 Pro'].forEach(function(v){a(v,v,'tablet')});
// POCO
['POCO F1','POCO F2 Pro','POCO F3','POCO F4','POCO F5','POCO F5 Pro','POCO F6','POCO F7','POCO F7 Pro','POCO F7 Ultra','POCO X3','POCO X3 Pro','POCO X4 Pro','POCO X5 Pro','POCO X6','POCO X6 Pro','POCO X7','POCO X7 Pro','POCO M3','POCO M4 Pro','POCO M5','POCO M6','POCO C65'].forEach(function(v){a(v,v,'phone')});
// Samsung
['SM-G9500','SM-G9550','SM-G9600','SM-G9650','SM-G9700','SM-G9730','SM-G9750','SM-G9770','SM-G9810','SM-G9860','SM-G9880','SM-G9910','SM-G9960','SM-G9980','SM-G7810','SM-S9010','SM-S9060','SM-S9080','SM-S9110','SM-S9160','SM-S9180','SM-S9210','SM-S9260','SM-S9280','SM-S9310','SM-S9360','SM-S9380','SM-S9420','SM-S9470','SM-S9480'].forEach(function(v){a(v,'Galaxy S '+v.slice(-4,-1),'phone')});
['SM-N9500','SM-N9600','SM-N9700','SM-N9760','SM-N9810','SM-N9860'].forEach(function(v){a(v,'Galaxy Note '+v.slice(-4,-1),'phone')});
['SM-F9000','SM-F9160','SM-F9260','SM-F9360','SM-F9460','SM-F9560','SM-F9660','SM-F7000','SM-F7110','SM-F7210','SM-F7310','SM-F7410','SM-F7660','SM-F7610'].forEach(function(v){a(v,'Galaxy Z '+(v[5]==='7'?'Flip':'Fold')+' '+v.slice(-4,-1),'phone')});
['SM-T860','SM-T870','SM-T970','SM-T730','SM-X700','SM-X800','SM-X900','SM-X710','SM-X810','SM-X910','SM-X510','SM-X610','SM-X820','SM-X920','SM-X520','SM-X620'].forEach(function(v){a(v,'Galaxy Tab S'+v.slice(-4,-1),'tablet')});
// Huawei
['HUAWEI P20','HUAWEI P20 PRO','HUAWEI P30','HUAWEI P30 PRO','HUAWEI P40','HUAWEI P40 PRO','HUAWEI P50','HUAWEI P50 PRO','HUAWEI P60','HUAWEI P60 PRO'].forEach(function(v){a(v,v.replace('HUAWEI ','华为 '),'phone')});
['HUAWEI MATE 20','HUAWEI MATE 20 PRO','HUAWEI MATE 30','HUAWEI MATE 30 PRO','HUAWEI MATE 40','HUAWEI MATE 40 PRO','HUAWEI MATE 50','HUAWEI MATE 50 PRO','HUAWEI MATE 60','HUAWEI MATE 60 PRO','HUAWEI MATE 70','HUAWEI MATE 70 PRO','HUAWEI MATE 80','HUAWEI MATE 80 PRO'].forEach(function(v){a(v,v.replace('HUAWEI ','华为 '),'phone')});
['HUAWEI NOVA 9','HUAWEI NOVA 10','HUAWEI NOVA 11','HUAWEI NOVA 12','HUAWEI NOVA 13','HUAWEI NOVA 14'].forEach(function(v){a(v,v.replace('HUAWEI ','华为 '),'phone')});
// Honor
['HONOR 9','HONOR 10','HONOR 20','HONOR 30','HONOR 50','HONOR 60','HONOR OR')});
 MAGHONOR MAGIC4','HONOR MAGIC5','HONOR MAGIC6','HONOR MAGIC7'].forEach(function(v){a(v,v.replace('HONOR ','荣耀 '),'phone')});
// One('','加手机','phone');
['GM190','GM191','GM192'].forEach(function(v){a(v,'一加 7'+(v[4]==='1'?' Pro':'')+(v[4]==='2'?' Pro 5G':''),'phone')});
['HD190','HD191','HD192'].forEach(function(v){a(v,'一加 7T'+(v[4]==='1'?' Pro':'')+(v[4]==='2'?' Pro 5G':''),'phone')});
a('IN201','一加 8','phone');a('IN202','一加 8 Pro','phone');a('KB200','一加 8T','phone');
a('LE210','一加 9R','phone');a('LE211','一加 9','phone');a('LE212','一加 9 Pro','phone');
a('MT211','一加 9RT','phone');a('NE221','一加 10 Pro','phone');
a('PHB110','一加 11','phone');a('PHK110','一加 Ace 2','phone');a('PHP110','一加 Ace 2V','phone');
a('PJA110','一加 Ace 2 Pro','phone');a('PJD110','一加 12','phone');a('PJE110','一加 Ace 3','phone');
a('PJF110','一加 Ace 3V','phone');a('PJX110','一加 Ace 3 Pro','phone');a('PJZ110','一加 13','phone');
a('PKG110','一加 Ace 5','phone');a('PKR110','一加 Ace 5 Pro','phone');a('PKX110','一加 13T','phone');
a('PLK110','一加 15','phone');a('PLR110','一加 Ace 6T','phone');
// OPPO
['OPPO RENO','OPPO RENO2','OPPO RENO3','OPPO RENO4','OPPO RENO5','OPPO RENO6','OPPO RENO7','OPPO RENO8','OPPO RENO9','OPPO RENO10','OPPO RENO11','OPPO RENO12','OPPO RENO13'].forEach(function(v){a(v,v.replace('OPPO ','OPPO '),'phone')});
['OPPO FIND X','OPPO FIND X2','OPPO FIND X3','OPPO FIND X5','OPPO FIND X6','OPPO FIND X7','OPPO FIND X8','OPPO FIND X9','OPPO FIND N','OPPO FIND N2','OPPO FIND N3','OPPO FIND N5'].forEach(function(v){a(v,v,'phone')});
// vivo
['VIVO X50','VIVO X60','VIVO X70','VIVO X80','VIVO X90','VIVO X100','VIVO X200','VIVO X300'].forEach(function(v){a(v,v.replace('VIVO ','vivo '),'phone')});
a('IQOO','iQOO','phone');['IQOO 3','IQOO 5','IQOO 7','IQOO 8','IQOO 9','IQOO 10','IQOO 11','IQOO 12','IQOO 13','IQOO 15'].forEach(function(v){a(v,v,'phone')});
// Google Pixel
['PIXEL','PIXEL XL','PIXEL 2','PIXEL 2 XL','PIXEL 3','PIXEL 3 XL','PIXEL 3A','PIXEL 4','PIXEL 4 XL','PIXEL 4A','PIXEL 5','PIXEL 5A','PIXEL 6','PIXEL 6 PRO','PIXEL 6A','PIXEL 7','PIXEL 7 PRO','PIXEL 7A','PIXEL 8','PIXEL 8 PRO','PIXEL 8A','PIXEL 9','PIXEL 9 PRO','PIXEL 9 PRO XL','PIXEL 9A','PIXEL 10','PIXEL 10 PRO','PIXEL FOLD','PIXEL WATCH'].forEach(function(v){a(v,v,'phone')});
a('PIXEL WATCH','Pixel Watch','watch');
// realme
['RMX1901','RMX1931','RMX1991','RMX2121','RMX2141','RMX2176','RMX2202','RMX2200','RMX3310','RMX3300','RMX3366','RMX3370','RMX3461','RMX3560','RMX3610','RMX3687','RMX3706','RMX3740','RMX3760','RMX3800','RMX3820','RMX3841','RMX3888','RMX3920','RMX3940','RMX3992','RMX5000','RMX5010','RMX5050','RMX5060','RMX5070','RMX5080','RMX5090','RMX0','RMX6688','RMX8899'].forEach(function(v){a(v,'真我 '+v,'phone')});
// Meizu
['MEIZ 16','MEIZU 16S','MEIZU 16T','MEIZU 17','MEIZU 18','MEIZU 18X','MEIZU 20','MEIZU 21','MEIZU 22'].forEach(function(v){a(v,v.replace('MEIZU ','魅 XIA IV5PER','PERIA 10 II','XPERIA 10 III','XPERIA 10 IV','XPERIA 10 V','XPERIA 10 VI'].forEach(function(v){a(v,'Xperia '+v.slice(7),'phone')});
// ASUS ROG
['ASUS ROG PHONE','ASUS ROG PHONE 2','ASUS ROG PHONE 3','ASUS ROG PHONE 5','ASUS ROG PHONE 6','ASUS ROG PHONE 7','ASUS ROG PHONE 8','ASUS ROG PHONE 9'].forEach(function(v){a(v,'ROG Phone '+v.slice(-1),'phone')});
a('ASUS ZENFONE','ZenFone','phone');
// Nothing
['NOTHING PHONE (1)','NOTHING PHONE (2)','NOTHING PHONE (2A)','NOTHING PHONE (3)','NOTHING PHONE (3A)'].forEach(function(v){a(v,v,'phone')});
// Nubia & RedMagic
['NX659J','NX669J','NX679J','NX709J','NX729J','NX769J','NX789J','NX809J','NX721J','NX733J','NX741J'].forEach(function(v){a(v,'努比亚 '+v,'phone')});
// Motorola
['MOTO G','MOTO X','MOTO Z','MOTO EDGE','MOTO RAZR'].forEach(function(v){a(v,v,'phone')});
['MOTO G50','MOTO G51','MOTO G53','MOTO G54','MOTO G55','MOTO G75','MOTO G100'].forEach(function(v){a(v,'Moto '+v.slice(5),'phone')});
['MOTO EDGE 30','MOTO EDGE 40','MOTO EDGE 50'].forEach(function(v){a(v,v,'phone')});

function lookup(c){if(!c||c==='--')return null;var k=c.toUpperCase().trim();if(M[k])return F(M[k],k);var ks=Object.keys(M).sort(function(a,b){return b.length-a.length});for(var i=0;i<ks.length;i++){if(k.indexOf(ks[i])===0)return F(M[ks[i]],k)}return null}
function F(d,k){var bn=B[d[0]];return{brand:bn||d[0],name:d[1],type:d[2],code:k}}
return{lookup:lookup,getBrand:function(c){var i=lookup(c);return i?i.brand:null}}
}();
