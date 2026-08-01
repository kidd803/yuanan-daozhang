const posts = Array.isArray(window.YUANAN_POSTS) ? window.YUANAN_POSTS : [];
const archiveMeta = window.YUANAN_ARCHIVE_META || {};
const PAGE_SIZE = 60;
const DEFAULT_CATEGORY_ORDER = [
  '悟道真詮',
  '養生性命',
  '處世立命',
  '全真道脈',
  '修身養性',
  '人間修行',
  '丹道修真',
  '修心煉性',
  '龍門丹道',
  '道教經典'
];
const CATEGORY_ORDER = Array.isArray(archiveMeta.categoryOrder) && archiveMeta.categoryOrder.length
  ? archiveMeta.categoryOrder
  : DEFAULT_CATEGORY_ORDER;
const countFormat = new Intl.NumberFormat('zh-Hant');
const SECRET_PHRASES = ['林明心', '林明毅', '林圓安'];
const PUBLIC_PREVIEW_RATIO = 0.5;
const RECOMMENDATION_MIN_LENGTH = 320;
const ARTICLE_UNLOCK_KEY = 'yuanan-article-unlocked';
const SITE_URL = 'https://taoism.com.tw';
const PUBLIC_MEDIA_LIMIT = 6;
const SEARCH_TRACK_DELAY = 900;
const COPY_FEEDBACK_DELAY = 1400;
const DEFAULT_SORT = 'newest';
const SERIES_SORT = 'oldest';
const RECOMMENDATION_LIMIT = 3;
const RECOMMENDATION_MIN_BODY_LENGTH = 160;
const PUBLIC_PHOTO_KEYWORDS = ['照片', '參訪', '参访', '法會', '法会', '生日', '花', '樹', '树', '宮', '宫', '廟', '庙', '山', '海', '道場', '道场', '祖庭', '鹿邑', '青羊宮', '青羊宫', '崑崙', '昆仑', '華陽觀', '华阳观'];
const SENSITIVE_MEDIA_KEYWORDS = ['符', '咒', '口訣', '口诀', '真訣', '真诀', '講義', '讲义', '教材', '架構', '架构', '圖解', '图解', '紫微', '斗數', '斗数', '命盤', '命盘', '生肖', '手印'];
const SERIES_DISPLAY_NAMES = {
  '淺譯 道德經 81章': '淺譯《道德經》81 章',
  '黃元吉 道德經 81章': '黃元吉《道德經》81 章',
  '畫符 100講': '畫符 100 講',
  '紫微斗數推演 99': '紫微斗數推演 99 講'
};
const PILLAR_FILTERS = {
  '全真道入門': {
    categories: ['全真道脈', '道教經典'],
    series: ['全真道法統', '全真道歷史', '重陽立教十五論'],
    keywords: ['全真', '龍門', '法統', '道統', '宗脈', '祖庭', '師承', '冠巾', '皈依', '傳戒', '传戒', '王重陽', '王重阳', '丘處機', '丘处机', '北七真', '祖師', '祖师'],
    minScore: 3
  },
  '全真龍門道脈': {
    categories: ['全真道脈'],
    series: ['全真道法統', '全真道歷史', '重陽立教十五論'],
    keywords: ['全真', '龍門', '龙门', '道脈', '道脉', '王重陽', '王重阳', '丘處機', '丘处机', '太清宮', '太清宫', '鹿邑', '蓬萊', '蓬莱', '師承', '师承', '冠巾'],
    minScore: 2
  },
  '丹道修真': {
    categories: ['丹道修真', '龍門丹道', '養生性命'],
    series: ['圓安論氣功'],
    keywords: ['丹道', '內丹', '内丹', '性命', '築基', '筑基', '煉精', '炼精', '煉氣', '炼气', '煉神', '炼神', '打坐', '靜坐', '静坐', '火候', '綿息', '息法', '丹田', '任督'],
    minScore: 2
  },
  '修心煉性': {
    categories: ['修心煉性', '修身養性', '處世立命', '悟道真詮'],
    series: [],
    keywords: ['修心', '煉性', '炼性', '心性', '起心動念', '起心动念', '貪', '瞋', '癡', '放下', '無為', '无为', '虛靜', '虚静', '人情', '家庭', '工作', '煩惱', '烦恼'],
    minScore: 2
  },
  '經典講堂': {
    categories: ['道教經典'],
    series: ['龍門心法', '黃元吉 道德經 81章', '淺譯 道德經 81章', '重陽立教十五論', '聖濟總錄'],
    keywords: ['道德經', '道德经', '清靜經', '清静经', '重陽立教十五論', '重阳立教十五论', '龍門心法', '龙门心法', '聖濟總錄', '圣济总录', '太乙金華', '太乙金华', '丘祖', '祖師著作', '經典', '经典'],
    minScore: 2
  }
};
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const PALACE_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const YIN_PALACE_STEMS = {
  甲: '丙',
  己: '丙',
  乙: '戊',
  庚: '戊',
  丙: '庚',
  辛: '庚',
  丁: '壬',
  壬: '壬',
  戊: '甲',
  癸: '甲'
};
const STEM_CLASS_NUMBERS = {
  甲: 1,
  乙: 1,
  丙: 2,
  丁: 2,
  戊: 3,
  己: 3,
  庚: 4,
  辛: 4,
  壬: 5,
  癸: 5
};
const BRANCH_CLASS_NUMBERS = {
  子: 1,
  午: 1,
  丑: 1,
  未: 1,
  寅: 2,
  申: 2,
  卯: 2,
  酉: 2,
  辰: 3,
  戌: 3,
  巳: 3,
  亥: 3
};
const FIVE_ELEMENT_CLASSES = {
  1: { label: '木三局', value: 3, element: '木' },
  2: { label: '金四局', value: 4, element: '金' },
  3: { label: '水二局', value: 2, element: '水' },
  4: { label: '火六局', value: 6, element: '火' },
  5: { label: '土五局', value: 5, element: '土' }
};
const ZIWEI_MAJOR_STARS = ['紫微', '天機', '', '太陽', '武曲', '天同', '', '', '廉貞'];
const TIANFU_MAJOR_STARS = ['天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '', '', '', '破軍'];
const STEM_ELEMENTS = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水'
};
const ELEMENT_GENERATES = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木'
};
const ELEMENT_CONTROLS = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木'
};
const YEAR_TRANSFORMS = {
  甲: { 化祿: '廉貞', 化權: '破軍', 化科: '武曲', 化忌: '太陽' },
  乙: { 化祿: '天機', 化權: '天梁', 化科: '紫微', 化忌: '太陰' },
  丙: { 化祿: '天同', 化權: '天機', 化科: '文昌', 化忌: '廉貞' },
  丁: { 化祿: '太陰', 化權: '天同', 化科: '天機', 化忌: '巨門' },
  戊: { 化祿: '貪狼', 化權: '太陰', 化科: '右弼', 化忌: '天機' },
  己: { 化祿: '武曲', 化權: '貪狼', 化科: '天梁', 化忌: '文曲' },
  庚: { 化祿: '太陽', 化權: '武曲', 化科: '太陰', 化忌: '天同' },
  辛: { 化祿: '巨門', 化權: '太陽', 化科: '文曲', 化忌: '文昌' },
  壬: { 化祿: '天梁', 化權: '紫微', 化科: '左輔', 化忌: '武曲' },
  癸: { 化祿: '破軍', 化權: '巨門', 化科: '太陰', 化忌: '貪狼' }
};
const STAR_ELEMENTS = {
  廉貞: '火',
  破軍: '水',
  武曲: '金',
  太陽: '火',
  天機: '木',
  天府: '土',
  天梁: '土',
  紫微: '土',
  太陰: '水',
  天同: '水',
  天相: '水',
  七殺: '金',
  文昌: '金',
  巨門: '水',
  貪狼: '木',
  右弼: '水',
  文曲: '水',
  左輔: '土'
};
const TRANSFORM_MEANINGS = {
  化祿: '先天資糧',
  化權: '先天行動模式',
  化科: '先天智慧模式',
  化忌: '祖上承負與人生課題'
};
const TRANSFORM_PLAIN_TEXT = {
  化祿: '比較容易發揮、也比較容易得到助力的地方。',
  化權: '遇到事情時，最習慣用力與行動的方式。',
  化科: '理解事情、整理文字、學習表達的方式。',
  化忌: '容易卡住、執著、想證明，最需要修心的地方。'
};
const STAR_PLAIN_TEXT = {
  廉貞: '規矩、界線、取捨與自我要求',
  破軍: '突破、改變、推翻重來與冒險',
  武曲: '執行、財務、效率與實際成果',
  太陽: '承擔、照顧、公開行動與責任感',
  天機: '思考、變通、方法與計畫',
  天府: '庫藏、穩定、承載與資源管理',
  天梁: '保護、長輩、原則與照應',
  紫微: '統整、主導、格局與管理',
  太陰: '內在感受、照顧、細膩與收藏',
  天同: '安適、人情、享受與依賴',
  天相: '輔佐、制度、禮法與協調',
  七殺: '決斷、突破、壓力與開創',
  文昌: '知識、標準、文書與判斷',
  巨門: '說話、辨析、疑問與溝通',
  貪狼: '欲望、人緣、才藝與外緣',
  右弼: '輔助、配合、貴人與補位',
  文曲: '文字、美感、整理與表達',
  左輔: '協助、承擔、團隊與穩定支持'
};
const MAIN_STAR_PROFILES = {
  紫微: { topic: '守中', risk: '想統整全局，反而容易把責任全攬在身上', method: '先定主次，該放手的事交出去。' },
  天機: { topic: '整理', risk: '想法太多，計畫一直變', method: '今天只選一個方法走到底。' },
  太陽: { topic: '節制', risk: '太想照顧大家，心力外放', method: '先照顧自己的氣，再處理別人的事。' },
  武曲: { topic: '謙卑', risk: '過度要求效率與成果', method: '把標準放回基本功，不急著看結果。' },
  天同: { topic: '守中', risk: '想求安適，容易拖延或依賴', method: '用固定作息把心收回來。' },
  廉貞: { topic: '忍辱', risk: '對界線與對錯太敏感', method: '先降火氣，再談規矩。' },
  天府: { topic: '整理', risk: '資源想收太多，反而不流通', method: '清點手上資源，先用已有的。' },
  太陰: { topic: '放下', risk: '情緒細膩，容易把事放在心裡', method: '把感受寫下來，今天先不反覆回想。' },
  貪狼: { topic: '節制', risk: '外緣多，容易被人事與欲望牽動', method: '少應酬，少開新念頭。' },
  巨門: { topic: '忍辱', risk: '想說清楚、辯明白，容易口舌', method: '話慢一點，只說必要的。' },
  天相: { topic: '守中', risk: '太在意規矩與他人評價', method: '照制度做，不替所有人圓場。' },
  天梁: { topic: '謙卑', risk: '容易站在保護與原則的位置，替人擔心或評斷', method: '先照應自己，再用柔和的方式提醒他人。' },
  七殺: { topic: '忍辱', risk: '決斷太快，容易用力過猛', method: '先停下來看清局勢，再行動。' },
  破軍: { topic: '放下', risk: '想推翻重來，容易急著改變', method: '先放下衝動，分段處理。' }
};
const MAIN_STAR_DESCRIPTIONS = {
  紫微: '命宮主星為紫微，斗數稱帝星、諸星之主，主尊嚴、權柄、統御、中正與穩重。紫微入命的人，心中常有主位意識，遇事會想總攝全局、建立秩序，也容易被推到負責與決策的位置。紫微喜輔弼、昌曲、魁鉞等吉曜朝拱，忌孤君獨坐或煞曜侵陵；所以這顆星不是只看領導力，而要看是否有人才、制度與德性相輔。',
  天機: '命宮主星為天機，屬南斗第三星，五行陰木，化氣為善，取象為謀臣，主思維、機變、策劃、分析與溝通。天機入命的人，腦筋轉得快，善於找方法、看變化、拆解問題，適合用智慧與專業立身。天機也是四化容易引動的星，吉則機謀成事，煞忌則多思、多疑、反覆不定；所以重點不只是聰明，而是能不能把心定住。',
  太陽: '命宮主星為太陽，屬丙火，為中天陽星之精，化氣為貴，主光明、博愛、聲名、權貴與公開事務。太陽入命的人，性情較外放，重義氣與責任，喜歡把事情攤在明處，也常在工作、教育、傳播、公職或服務人群中發光。太陽廟旺則光明正大，落陷或化忌則付出多、回收少，容易因男性長輩、名聲或責任感生煩惱。',
  武曲: '命宮主星為武曲，屬北斗財星，五行陰金，化氣為財，主有形之財、執行力、紀律、武職與實業。武曲入命的人重實際，不愛空談，做事講效率、成果與責任，適合財務、金融、管理、工程、技術、軍警等需要決斷與紀律的路線。武曲也帶寡宿與剛決之性，吉則財權兩得，煞重則剛極生折，容易因太硬而傷人傷己。',
  天同: '命宮主星為天同，屬南斗第四星，五行陽水，化氣為福，為福德主、益壽星，主安樂、調和、順遂與人情。天同入命的人多半不喜爭鬥，性情溫和，有福氣感，也容易在文藝、服務、休閒、照顧型工作中得力。天同的問題不是沒有福，而是福厚容易貪安，遇壓力時會想逃避、拖延或依賴；所以要借規矩與功課把福氣轉成修持。',
  廉貞: '命宮主星為廉貞，屬北斗第五星，化氣為囚，五行陰火兼金，又帶次桃花之象，主是非、原則、情感、規劃與權威。廉貞入命的人對界線、規矩、名節與情感都敏銳，有敢衝敢闖的一面，也有很強的自我要求。廉貞吉則能以規矩成權，以才情成事；煞忌重時，容易陷入執念、口舌、感情牽纏或精神壓迫。',
  天府: '命宮主星為天府，為南斗主星，化氣為庫，五行陽土，與紫微並稱帝星雙璧。天府主庫藏、守成、管理、資源統籌、衣食與承載力。天府入命的人通常穩重寬厚，重安全感，善於保存資源、安排人事與管理財庫。天府吉則財庫充盈、厚道受尊；但過度時會保守、懶散、怕失去，資源收太多反而不流通，守成變成固守。',
  太陰: '命宮主星為太陰，為中天星，五行癸陰水，在天為月之精，化氣為富，兼主潔，亦為田宅主、財星與母星。太陰入命的人心思細膩、內斂、重感受，對家庭、居住、財務、審美與照顧很有感。太陰廟旺則清貴、富厚、溫柔有涵養；落陷或煞忌則多思多慮，情緒容易內收，常把話與壓力放在心裡，久了變成牽掛。',
  貪狼: '命宮主星為貪狼，屬北斗正曜，五行甲木兼癸水，化氣為桃花，亦稱第一桃花星，主壽、禍福、遊樂、交際、欲望與才藝，並屬殺破狼三合體系。貪狼入命的人外緣強，反應快，能融通人情、整合資源，也常有藝術、公關、娛樂、業務或跨界能力。吉則人緣化機會，煞忌則欲望牽心，容易因酒色財氣或人事誘惑而失序。',
  巨門: '命宮主星為巨門，屬北斗第二星，化氣為暗，取象為口，五行主癸水兼己土，司掌是非、洞察、辯才、隱秘與疑問。巨門入命的人擅長看破問題、追問真相、辨析語言，適合教學、法律、諮詢、傳播、研究等靠口才與分析立身的領域。巨門吉則口內生財、以辯成名；煞忌重則口舌是非、多疑猜忌，說得越多越容易傷氣。',
  天相: '命宮主星為天相，屬南斗五星之一，五行壬陽水，化氣為印，居佐帝之位，稱掌印官，主衣食、官祿、信譽、制度與協調。天相入命的人重禮法、分寸與名聲，善於輔佐、承辦、調停，也適合行政、管理、法規、服務與需要信用的工作。天相看格局很重夾宮與朝垣，得財蔭夾印則貴，遭刑忌夾印則印星蒙塵，容易為人情制度兩頭受壓。',
  天梁: '命宮主星為天梁，屬南斗第二星，化氣為蔭，別名蔭星、老人星，司壽與祿，核心在監察、清貴、化危解厄、醫藥宗教教育與庇護。天梁入命的人多有原則、慈心與照應他人的本能，遇事容易站在道理、長輩、規範的位置。天梁吉則逢凶化吉、受人尊敬；但也帶清高孤克，若執著於對錯，容易變成操心、評斷或說教。',
  七殺: '命宮主星為七殺，五行屬金，為將星，主剛猛、決斷、衝鋒、開創與壓力中的行動力。七殺入命的人不喜拖延，遇到局面混亂時反而能下判斷、承壓開路，適合軍警、開創、改革、競爭型或需要決斷的工作。七殺吉則權威果斷，大起大落中能成英雄格；煞忌重則急躁剛烈，容易先動後想，因用力太猛而傷人傷己。',
  破軍: '命宮主星為破軍，五行屬水，為耗星、變動星，主改革、破舊立新、先破後成與動中求利。破軍入命的人不容易安於現狀，對舊制度、舊習慣、舊關係常有打破重來的衝動，也有創業、工程、投機、轉型與開新局的能力。破軍吉則敢破敢立，能在變化中得利；煞忌重則耗散反覆，容易把該保存的也一併推翻。'
};
const ONE_PILLAR_TOPIC_RULES = {
  忍辱: {
    title: '忍辱',
    risk: '急著辯白、口氣變重',
    method: '先停三息，再回一句必要的話。',
    yi: '靜坐、慢回話、先把事情分清楚',
    ji: '爭辯、急著證明自己、情緒性決定',
    homework: '清靜經、忍辱降心',
    articleReason: '今日主修忍辱，優先讀能幫助降心、少口舌的文章。',
    keywords: ['忍辱', '戒瞋', '少說話', '口舌', '清靜']
  },
  放下: {
    title: '放下',
    risk: '反覆糾結、抓著一念不放',
    method: '把執著處寫下來，今天只觀照，不急著處理。',
    yi: '少攀緣、少比較、把執著處寫下來',
    ji: '反覆追問、鑽牛角尖、抓著舊事不放',
    homework: '清靜經、觀照起心動念',
    articleReason: '今日主修放下，優先讀能照見執著與妄念的文章。',
    keywords: ['放下', '執著', '妄念', '起心動念', '清靜']
  },
  守中: {
    title: '守中',
    risk: '心裡知道方向，卻容易固執或拖著不動',
    method: '照原本規矩做，不臨時改方法。',
    yi: '守規律、穩住作息、照原計畫完成',
    ji: '固執己見、情緒悶住、拖延不動',
    homework: '靜坐、持誦清靜經',
    articleReason: '今日主修守中，優先讀能穩住日常修持與心性的文章。',
    keywords: ['守中', '清靜', '靜坐', '心性', '修心']
  },
  整理: {
    title: '整理',
    risk: '資源變多，反而貪多失序',
    method: '先列次第，只完成最重要的一件事。',
    yi: '建立制度、整理資料、完成手邊工作',
    ji: '貪多、同時開太多事情、只想不做',
    homework: '龍門心法、戒行精嚴',
    articleReason: '今日主修整理，優先讀能建立次第、清淨身心的文章。',
    keywords: ['整理', '制度', '戒行', '龍門心法', '清淨身心']
  },
  節制: {
    title: '節制',
    risk: '心力外放，替別人扛太多',
    method: '今天先保留三分力，話少一點、事少接一點。',
    yi: '保留體力、少耗神、把話說短',
    ji: '過度付出、熬夜、替別人扛太多',
    homework: '養氣、收心返照',
    articleReason: '今日主修節制，優先讀能收心、養氣、保留精神的文章。',
    keywords: ['節制', '養氣', '收心', '精氣神', '養生']
  },
  謙卑: {
    title: '謙卑',
    risk: '容易用自己的標準評斷他人',
    method: '先問、先學、先做基本功，不急著下判斷。',
    yi: '請教、校正方法、先做基本功',
    ji: '驕慢、指責、以懂自居',
    homework: '重陽立教十五論、修身養性',
    articleReason: '今日主修謙卑，優先讀能回到戒行、師承與基本功的文章。',
    keywords: ['謙卑', '修身', '德行', '重陽立教十五論', '戒']
  }
};
const ONE_PILLAR_STORAGE_KEY = 'yuanan-one-pillar-year';
const ONE_PILLAR_NAME_KEY = 'yuanan-one-pillar-name';
const ONE_PILLAR_MONTH_KEY = 'yuanan-one-pillar-month';
const ONE_PILLAR_DAY_KEY = 'yuanan-one-pillar-day';
const ONE_PILLAR_HOUR_KEY = 'yuanan-one-pillar-hour';
const ONE_PILLAR_DEFAULT_YEAR = 1981;
const ONE_PILLAR_CALCULATION_MS = 1100;
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '臘月'];
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];
const LUNAR_HOURS = [
  { value: '', label: '不確定', branch: '', element: '', topic: '', summary: '未填出生時辰，本版不做時辰修正。' },
  { value: '子', label: '子時 23:00-00:59', branch: '子', element: '水', topic: '放下', summary: '子時水氣深，念頭容易內轉，宜放下與養氣。' },
  { value: '丑', label: '丑時 01:00-02:59', branch: '丑', element: '土', topic: '守中', summary: '丑時土氣藏，宜守規矩、穩住基本功。' },
  { value: '寅', label: '寅時 03:00-04:59', branch: '寅', element: '木', topic: '整理', summary: '寅時木氣生發，宜立願、定方向。' },
  { value: '卯', label: '卯時 05:00-06:59', branch: '卯', element: '木', topic: '整理', summary: '卯時木氣舒展，宜推動但不可貪多。' },
  { value: '辰', label: '辰時 07:00-08:59', branch: '辰', element: '土', topic: '守中', summary: '辰時土氣承轉，宜整理秩序、回到本分。' },
  { value: '巳', label: '巳時 09:00-10:59', branch: '巳', element: '火', topic: '節制', summary: '巳時火氣起，宜節制心氣與言語。' },
  { value: '午', label: '午時 11:00-12:59', branch: '午', element: '火', topic: '忍辱', summary: '午時火旺，容易急躁，宜先降心。' },
  { value: '未', label: '未時 13:00-14:59', branch: '未', element: '土', topic: '守中', summary: '未時土氣調和，宜穩住節奏。' },
  { value: '申', label: '申時 15:00-16:59', branch: '申', element: '金', topic: '謙卑', summary: '申時金氣收斂，宜檢點言行。' },
  { value: '酉', label: '酉時 17:00-18:59', branch: '酉', element: '金', topic: '謙卑', summary: '酉時金氣整肅，宜少批判、多自省。' },
  { value: '戌', label: '戌時 19:00-20:59', branch: '戌', element: '土', topic: '整理', summary: '戌時土氣收束，宜清理舊事。' },
  { value: '亥', label: '亥時 21:00-22:59', branch: '亥', element: '水', topic: '放下', summary: '亥時水氣歸藏，宜收心、沉澱、少攀緣。' }
];
const RELATION_TOPIC_KEYS = {
  sourceControlsTarget: '忍辱',
  sourceGeneratesTarget: '整理',
  targetGeneratesSource: '節制',
  targetControlsSource: '謙卑',
  same: '守中'
};
const LUNAR_MONTH_PROFILES = {
  正月: { element: '木', label: '春木生發', topic: '整理', summary: '適合發心、立願、把方向定清楚。' },
  二月: { element: '木', label: '木氣舒展', topic: '整理', summary: '適合開始推動，但要先整理次第。' },
  三月: { element: '土', label: '土氣轉承', topic: '守中', summary: '適合收束雜事，回到規矩與本分。' },
  四月: { element: '火', label: '火氣漸旺', topic: '節制', summary: '容易心氣外放，宜少耗神、少逞快。' },
  五月: { element: '火', label: '火旺易躁', topic: '忍辱', summary: '最忌急躁與口舌，宜先降心。' },
  六月: { element: '土', label: '土氣調和', topic: '守中', summary: '適合穩住節奏，先把基本功做好。' },
  七月: { element: '金', label: '金氣初收', topic: '謙卑', summary: '適合收斂鋒芒，回到戒行與分寸。' },
  八月: { element: '金', label: '金氣整肅', topic: '謙卑', summary: '適合整頓言行，少批判、多自省。' },
  九月: { element: '土', label: '土氣厚重', topic: '整理', summary: '適合建立制度，補上長期忽略的基礎。' },
  十月: { element: '水', label: '水氣內藏', topic: '放下', summary: '適合內觀、放下執著，少向外攀緣。' },
  冬月: { element: '水', label: '水氣深藏', topic: '放下', summary: '適合沉澱、養氣，讓念頭慢下來。' },
  臘月: { element: '土', label: '土氣收尾', topic: '整理', summary: '適合清理舊事，為下一步鋪路。' }
};
const LUNAR_DAY_PHASES = [
  { max: 5, label: '初生立願', topic: '整理', summary: '先定方向，不急著求結果。' },
  { max: 10, label: '成形守規', topic: '守中', summary: '照規矩做，少換方法。' },
  { max: 15, label: '盈滿慎言', topic: '節制', summary: '事情容易放大，宜節制言語與情緒。' },
  { max: 20, label: '回照放下', topic: '放下', summary: '適合觀照執著，從心裡鬆開。' },
  { max: 25, label: '整肅修身', topic: '謙卑', summary: '適合檢點言行，回到師承與基本功。' },
  { max: 30, label: '收尾降心', topic: '忍辱', summary: '適合少爭、少辯，把心收回來。' }
];

const state = {
  category: '全部',
  query: '',
  sort: DEFAULT_SORT,
  year: '全部年份',
  series: '全部系列',
  pillar: '',
  visible: PAGE_SIZE,
  selectedId: null,
  recommendationHour: currentHourKey(),
  unlocked: readUnlockState()
};

const summary = document.querySelector('#summary');
const seriesBar = document.querySelector('#seriesBar');
const categoryBar = document.querySelector('#categoryBar');
const stats = document.querySelector('.stats');
const postList = document.querySelector('#postList');
const reader = document.querySelector('#reader');
const searchInput = document.querySelector('#searchInput');
const yearSelect = document.querySelector('#yearSelect');
const seriesSelect = document.querySelector('#seriesSelect');
const sortSelect = document.querySelector('#sortSelect');
const resultTitle = document.querySelector('#resultTitle');
const resultMeta = document.querySelector('#resultMeta');
const loadMoreButton = document.querySelector('#loadMoreButton');
const template = document.querySelector('#postTemplate');
const quickSearches = document.querySelector('.quick-searches');
const pillarSections = document.querySelector('.pillar-sections');
const onePillarNameInput = document.querySelector('#onePillarNameInput');
const onePillarYearInput = document.querySelector('#onePillarYearInput');
const onePillarMonthSelect = document.querySelector('#onePillarMonthSelect');
const onePillarDaySelect = document.querySelector('#onePillarDaySelect');
const onePillarHourSelect = document.querySelector('#onePillarHourSelect');
const onePillarStemSelect = document.querySelector('#onePillarStemSelect');
const onePillarButton = document.querySelector('#onePillarButton');
const onePillarResult = document.querySelector('#onePillarResult');
const floatingSearchButton = document.querySelector('#floatingSearchButton');
const courseFrameworkOpen = document.querySelector('#courseFrameworkOpen');
const foundationSeriesOpen = document.querySelector('#foundationSeriesOpen');
const courseFrameworkLightbox = document.querySelector('#courseFrameworkLightbox');
const courseFrameworkClose = courseFrameworkLightbox?.querySelector('.image-lightbox-close');
const courseFrameworkLightboxImage = courseFrameworkLightbox?.querySelector('img');
let activeLightboxTrigger = null;
let searchTrackTimer = null;
let onePillarCalculateTimer = null;

const categoryCounts = countBy(posts, (post) => post.category || '未分類');
const seriesCounts = countSeries(posts);
const years = [...new Set(posts.map((post) => post.date?.slice(0, 4)).filter(Boolean))]
  .sort((a, b) => b.localeCompare(a));
const seriesNames = [...seriesCounts.keys()].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
const earliestPost = posts.reduce((earliest, post) => !earliest || post.timestamp < earliest.timestamp ? post : earliest, null);
const latestPost = posts.reduce((latest, post) => !latest || post.timestamp > latest.timestamp ? post : latest, null);

populateOptions();
populateOnePillarOptions();
bindEvents();
render();

function bindEvents() {
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    state.category = '全部';
    state.year = '全部年份';
    state.series = '全部系列';
    state.pillar = '';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    render();
    scheduleSearchTracking('search_input');
  });

  yearSelect.addEventListener('change', () => {
    state.year = yearSelect.value;
    state.category = '全部';
    state.series = '全部系列';
    state.pillar = '';
    state.query = '';
    searchInput.value = '';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    render();
    trackEvent('filter_year', {
      filter_year: state.year,
      result_count: matchPosts().length
    });
  });

  seriesSelect?.addEventListener('change', () => {
    selectSeries(seriesSelect.value);
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.visible = PAGE_SIZE;
    render();
    trackEvent('sort_articles', {
      sort_order: state.sort
    });
  });

  onePillarYearInput?.addEventListener('input', () => {
    const stem = parseYearStem(onePillarYearInput.value);
    if (stem && onePillarStemSelect) onePillarStemSelect.value = stem;
    clearOnePillarResult();
  });

  onePillarNameInput?.addEventListener('input', () => {
    const name = onePillarNameInput.value.trim();
    window.localStorage.setItem(ONE_PILLAR_NAME_KEY, name);
    clearOnePillarResult();
  });

  onePillarMonthSelect?.addEventListener('change', () => {
    clearOnePillarResult();
  });

  onePillarDaySelect?.addEventListener('change', () => {
    clearOnePillarResult();
  });

  onePillarHourSelect?.addEventListener('change', () => {
    clearOnePillarResult();
  });

  onePillarStemSelect?.addEventListener('change', () => {
    clearOnePillarResult();
  });

  onePillarButton?.addEventListener('click', () => {
    scheduleOnePillarCalculation();
  });

  loadMoreButton.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    render();
    trackEvent('load_more_articles', {
      visible_count: state.visible,
      result_count: matchPosts().length
    });
  });

  floatingSearchButton?.addEventListener('click', returnToSearch);
  courseFrameworkOpen?.addEventListener('click', () => {
    openImageLightbox('assets/yuanan-course-framework.jpg', '圓安道長九科高階課程架構放大圖', courseFrameworkOpen);
  });
  foundationSeriesOpen?.addEventListener('click', () => {
    openImageLightbox('assets/yuanan-foundation-series.jpg', '全真基礎研讀六大系列放大圖', foundationSeriesOpen);
  });
  courseFrameworkClose?.addEventListener('click', closeImageLightbox);
  courseFrameworkLightbox?.addEventListener('click', (event) => {
    if (event.target === courseFrameworkLightbox) closeImageLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !courseFrameworkLightbox?.hidden) closeImageLightbox();
  });

  quickSearches.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-query]');
    if (!button) return;
    state.query = button.dataset.query || '';
    state.category = '全部';
    state.year = '全部年份';
    state.series = '全部系列';
    state.pillar = '';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    searchInput.value = state.query;
    render();
    trackEvent('quick_search', {
      search_term: state.query,
      result_count: matchPosts().length
    });
    scrollToResultsOnMobile();
  });

  pillarSections?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-pillar]');
    if (!button) return;
    selectPillar(button);
  });

  bindAnalyticsLinks();

  setInterval(() => {
    const nextHour = currentHourKey();
    if (nextHour === state.recommendationHour) return;
    state.recommendationHour = nextHour;
    if (!state.selectedId) render();
  }, 60000);
}

function populateOptions() {
  yearSelect.append(...years.map((year) => option(year)));
  seriesSelect?.append(...seriesNames.map((series) => option(series)));
}

function populateOnePillarOptions() {
  onePillarMonthSelect?.replaceChildren(...LUNAR_MONTHS.map((month) => option(month)));
  onePillarDaySelect?.replaceChildren(...LUNAR_DAYS.map((day) => option(day)));
  onePillarHourSelect?.replaceChildren(...LUNAR_HOURS.map((hour) => {
    const item = option(hour.value);
    item.textContent = hour.label;
    return item;
  }));
  onePillarStemSelect?.replaceChildren(...HEAVENLY_STEMS.map((stem) => {
      const item = option(stem);
      item.textContent = `${stem}（${STEM_ELEMENTS[stem]}）`;
      return item;
    }));
  const saved = window.localStorage.getItem(ONE_PILLAR_STORAGE_KEY);
  const initialYear = parseGregorianYear(saved) || parseGregorianYear(onePillarYearInput?.value || '') || ONE_PILLAR_DEFAULT_YEAR;
  const stem = parseYearStem(saved || `${initialYear}`) || sexagenaryYearFromGregorian(initialYear).stem;
  const savedName = window.localStorage.getItem(ONE_PILLAR_NAME_KEY) || '';
  if (onePillarNameInput) onePillarNameInput.value = savedName;
  if (onePillarYearInput) onePillarYearInput.value = initialYear;
  if (onePillarMonthSelect) onePillarMonthSelect.value = window.localStorage.getItem(ONE_PILLAR_MONTH_KEY) || '正月';
  if (onePillarDaySelect) onePillarDaySelect.value = window.localStorage.getItem(ONE_PILLAR_DAY_KEY) || '初一';
  if (onePillarHourSelect) onePillarHourSelect.value = window.localStorage.getItem(ONE_PILLAR_HOUR_KEY) || '';
  if (onePillarStemSelect) onePillarStemSelect.value = stem;
}

function scheduleOnePillarCalculation() {
  if (!onePillarResult) return;
  resetOnePillarCalculation();
  renderOnePillarCalculating();
  setOnePillarButtonBusy(true);
  onePillarCalculateTimer = window.setTimeout(() => {
    onePillarCalculateTimer = null;
    renderOnePillarResult();
    setOnePillarButtonBusy(false);
    trackOnePillarReading();
  }, ONE_PILLAR_CALCULATION_MS);
}

function renderOnePillarCalculating() {
  if (!onePillarResult) return;
  onePillarResult.hidden = false;
  const panel = document.createElement('div');
  panel.className = 'one-pillar-calculating';
  const mark = document.createElement('div');
  mark.className = 'one-pillar-calculating-mark';
  mark.setAttribute('aria-hidden', 'true');
  const title = document.createElement('strong');
  title.textContent = '正在試算今日修心';
  const text = document.createElement('p');
  text.textContent = '排出生年四化、命宮主星與今日干支後，再給出今日最該修的一念。';
  const steps = document.createElement('div');
  steps.className = 'one-pillar-calculating-steps';
  ['生年四化', '命宮主星', '今日干支'].forEach((label) => {
    const item = document.createElement('span');
    item.textContent = label;
    steps.append(item);
  });
  panel.append(mark, title, text, steps);
  onePillarResult.replaceChildren(panel);
}

function setOnePillarButtonBusy(isBusy) {
  if (!onePillarButton) return;
  onePillarButton.disabled = isBusy;
  onePillarButton.setAttribute('aria-busy', isBusy ? 'true' : 'false');
  onePillarButton.textContent = isBusy ? '推算中...' : '試算今日修心';
}

function resetOnePillarCalculation() {
  if (onePillarCalculateTimer) {
    window.clearTimeout(onePillarCalculateTimer);
    onePillarCalculateTimer = null;
  }
  setOnePillarButtonBusy(false);
}

function trackOnePillarReading() {
  const birthYear = parseGregorianYear(onePillarYearInput?.value || '') || ONE_PILLAR_DEFAULT_YEAR;
  const birthStem = onePillarStemSelect?.value || parseYearStem(onePillarYearInput?.value || '') || sexagenaryYearFromGregorian(birthYear).stem;
  const mainStar = calculateMainStar(birthStem, onePillarMonthSelect?.value || '正月', onePillarDaySelect?.value || '初一', onePillarHourSelect?.value || '');
  trackEvent('one_pillar_daily_reading', {
    birth_year: birthYear,
    birth_stem: birthStem,
    lunar_month: onePillarMonthSelect?.value || '',
    lunar_day: onePillarDaySelect?.value || '',
    birth_hour: onePillarHourSelect?.value || '',
    main_star: mainStar?.name || '',
    ming_palace: mainStar?.palaceLabel || '',
    day_ganzhi: sexagenaryDay(new Date()).label
  });
}

function renderOnePillarResult() {
  if (!onePillarResult) return;
  onePillarResult.hidden = false;
  const inputValue = onePillarYearInput?.value || `${ONE_PILLAR_DEFAULT_YEAR}`;
  const birthYear = parseGregorianYear(inputValue) || ONE_PILLAR_DEFAULT_YEAR;
  const yearGanzhi = sexagenaryYearFromGregorian(birthYear);
  const autoStem = parseYearStem(inputValue) || yearGanzhi.stem;
  const stem = onePillarStemSelect?.value || autoStem;
  const personName = onePillarNameInput?.value.trim() || '同修';
  const lunarMonth = onePillarMonthSelect?.value || '正月';
  const lunarDay = onePillarDaySelect?.value || '初一';
  const birthHour = onePillarHourSelect?.value || '';
  const birthHourLabel = LUNAR_HOURS.find((hour) => hour.value === birthHour)?.label || '不確定';
  const birthNote = `${birthYear} 年生，農曆${lunarMonth}${lunarDay}${birthHour ? `，${birthHourLabel}` : ''}`;
  if (onePillarStemSelect) onePillarStemSelect.value = stem;
  if (onePillarYearInput) window.localStorage.setItem(ONE_PILLAR_STORAGE_KEY, `${birthYear}`);
  if (onePillarNameInput) window.localStorage.setItem(ONE_PILLAR_NAME_KEY, onePillarNameInput.value.trim());
  if (onePillarMonthSelect) window.localStorage.setItem(ONE_PILLAR_MONTH_KEY, lunarMonth);
  if (onePillarDaySelect) window.localStorage.setItem(ONE_PILLAR_DAY_KEY, lunarDay);
  if (onePillarHourSelect) window.localStorage.setItem(ONE_PILLAR_HOUR_KEY, birthHour);

  const todayDate = new Date();
  const reading = buildOnePillarReading(stem, todayDate, lunarMonth, lunarDay, birthHour);
  const header = document.createElement('div');
  header.className = 'one-pillar-result-head';
  const today = document.createElement('p');
  today.className = 'eyebrow';
  today.textContent = `今日 ${formatMonthDay(todayDate)} · ${reading.day.label} · ${reading.day.element}氣`;
  const title = document.createElement('h3');
  title.textContent = `${personName}｜${reading.mainStar?.name ? `命宮主星：${reading.mainStar.name}｜` : ''}今日易失衡：${reading.topic.risk}`;
  const summaryText = document.createElement('p');
  summaryText.textContent = `${birthNote}。${reading.mainStar?.name ? `系統推得${reading.mainStar.palaceLabel}主星${reading.mainStar.name}，` : '出生時辰未定，先不排命宮主星；'}今日主修「${reading.topic.title}」，不是看吉凶，而是看今天最該修哪一念。`;
  header.append(today, title, summaryText);
  if (reading.mainStar?.name) {
    const mainStarIntro = document.createElement('div');
    mainStarIntro.className = 'one-pillar-main-star-summary';
    const introTitle = document.createElement('strong');
    introTitle.textContent = `${reading.mainStar.name}｜命宮主星介紹`;
    const introBody = document.createElement('p');
    introBody.textContent = mainStarDescriptionText(reading.mainStar);
    mainStarIntro.append(introTitle, introBody);
    header.append(mainStarIntro);
  }

  const pathPanel = document.createElement('section');
  pathPanel.className = 'one-pillar-path';
  const pathTitle = document.createElement('h4');
  pathTitle.textContent = '推算路徑';
  const pathList = document.createElement('ol');
  pathList.replaceChildren(
    onePillarPathStep('出生年', `${birthYear} 年約為${yearGanzhi.label}，取${reading.stem}${reading.birthElement}作本命本氣。`),
    onePillarPathStep('命宮主星', reading.mainStar ? `${reading.mainStar.palaceLabel}，${reading.mainStar.fiveElementClass}，主星${reading.mainStar.name}；${reading.mainStar.meaning}。` : '未填出生時辰，暫不安命宮主星。'),
    onePillarPathStep('本命四化', reading.lifePattern),
    onePillarPathStep('今日天地', `${reading.day.label}為${reading.day.element}氣，與本命形成${reading.primaryRelation.label}，所以${reading.primaryRelation.summary}`),
    onePillarPathStep('生日修正', `農曆${lunarMonth}${lunarDay}：${reading.birthday.summary}`),
    onePillarPathStep('時辰修正', reading.birthHour.summary)
  );
  pathPanel.append(pathTitle, pathList);

  const practiceCards = document.createElement('div');
  practiceCards.className = 'one-pillar-cards one-pillar-practice-cards';
  practiceCards.append(
    onePillarCard('命宮主星', reading.mainStar ? `${reading.mainStar.name}：${reading.mainStar.profile?.risk || reading.mainStar.meaning}` : '選定出生時辰後自動推算'),
    onePillarCard('今日主修', reading.topic.title),
    onePillarCard('容易失衡', reading.topic.risk),
    onePillarCard('修法', reading.topic.method),
    onePillarCard('採用原因', reading.topic.reasonText),
    onePillarCard('今日宜', reading.topic.yi),
    onePillarCard('今日忌', reading.topic.ji),
    onePillarCard('今日功課', reading.topic.homework),
    onePillarCard('承負提醒', reading.correction)
  );

  const transformPanel = document.createElement('section');
  transformPanel.className = 'one-pillar-transforms';
  const transformTitle = document.createElement('h4');
  transformTitle.textContent = '命宮主星｜生年四化';
  const transformNote = document.createElement('p');
  transformNote.className = 'one-pillar-note';
  transformNote.textContent = reading.mainStar
    ? '命宮主星由農曆月日與時辰推算；生年四化由出生年干推算。'
    : '未填出生時辰時，先看生年四化；選定時辰後會自動推命宮主星。';
  const starIntroList = document.createElement('div');
  starIntroList.className = 'one-pillar-star-list';
  const starCards = [];
  starCards.push(...reading.transforms.map((item) => onePillarStarIntroCard(item.star, item.name, item.starMeaning)));
  starIntroList.replaceChildren(...starCards);
  const transformSubTitle = document.createElement('h5');
  transformSubTitle.textContent = '四化在本命中的作用';
  const transformList = document.createElement('dl');
  transformList.replaceChildren(...reading.transforms.flatMap((item) => {
    const term = document.createElement('dt');
    term.textContent = `${item.name}：${item.star}`;
    const detail = document.createElement('dd');
    detail.textContent = `${item.meaning}，意思是${item.plainMeaning}${item.star}偏向${item.starMeaning}；今日形成${item.relation.label}，${onePillarTransformTodayText(item)}`;
    return [term, detail];
  }));
  transformPanel.append(transformTitle, transformNote, starIntroList, transformSubTitle, transformList);

  const recommendationPanel = document.createElement('section');
  recommendationPanel.className = 'one-pillar-recommendations';
  const recTitle = document.createElement('h4');
  recTitle.textContent = '今日推薦文章';
  const recList = document.createElement('div');
  recList.className = 'one-pillar-recommendation-list';
  recList.replaceChildren(...reading.recommendations.map(({ post, label, reason }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'one-pillar-recommendation';
    button.addEventListener('click', () => openRecommendedPost(post.id, 'one_pillar_recommendation'));
    const labelNode = document.createElement('span');
    labelNode.textContent = label;
    const strong = document.createElement('strong');
    strong.textContent = recommendationTitle(post);
    const meta = document.createElement('small');
    meta.textContent = [post.date, post.series || post.category].filter(Boolean).join(' · ');
    const why = document.createElement('small');
    why.textContent = reason;
    button.append(labelNode, strong, why, meta);
    return button;
  }));
  recommendationPanel.append(recTitle, recList);

  const actions = document.createElement('div');
  actions.className = 'one-pillar-result-actions';
  const collapseButton = document.createElement('button');
  collapseButton.type = 'button';
  collapseButton.className = 'one-pillar-collapse-button';
  collapseButton.textContent = '收起結果';
  collapseButton.addEventListener('click', () => {
    clearOnePillarResult();
    trackEvent('one_pillar_collapse_result');
  });
  actions.append(collapseButton);

  onePillarResult.replaceChildren(actions, header, pathPanel, practiceCards, transformPanel, recommendationPanel);
}

function clearOnePillarResult() {
  if (!onePillarResult) return;
  resetOnePillarCalculation();
  onePillarResult.replaceChildren();
  onePillarResult.hidden = true;
}

function onePillarCard(label, value) {
  const card = document.createElement('div');
  card.className = 'one-pillar-card';
  const term = document.createElement('span');
  term.textContent = label;
  const data = document.createElement('strong');
  data.textContent = value;
  card.append(term, data);
  return card;
}

function onePillarPathStep(label, text) {
  const item = document.createElement('li');
  const strong = document.createElement('strong');
  strong.textContent = label;
  const span = document.createElement('span');
  span.textContent = text;
  item.append(strong, span);
  return item;
}

function onePillarStarIntroCard(star, roleText, bodyText) {
  const card = document.createElement('article');
  card.className = 'one-pillar-star-card';
  const starName = document.createElement('strong');
  starName.textContent = star;
  const role = document.createElement('span');
  role.textContent = roleText;
  const meaning = document.createElement('p');
  meaning.textContent = bodyText;
  card.append(starName, role, meaning);
  return card;
}

function mainStarDescriptionText(mainStar) {
  const profile = mainStar?.profile;
  const base = mainStar?.description || '';
  const ziweiNote = '此段依站內「紫微斗數推演99講」整理。斗數不可只用單星斷一生，仍要看廟旺落陷、四化引動、吉煞交會與三方四正；此處先取命宮主星作修心入口，幫你看見這顆星的正用與偏病。';
  const practice = profile
    ? `容易失衡：${profile.risk}。修心方向：${profile.method}`
    : '修心方向：先看見自己的慣性，再回到今日主修，不急著用吉凶判斷自己。';
  return `${base}${ziweiNote}${practice}`;
}

function buildOnePillarReading(stem, date, lunarMonth = '正月', lunarDay = '初一', birthHour = '') {
  const birthElement = STEM_ELEMENTS[stem] || '金';
  const day = sexagenaryDay(date);
  const primaryRelation = elementRelation(day.element, birthElement);
  const transforms = Object.entries(YEAR_TRANSFORMS[stem] || YEAR_TRANSFORMS.辛).map(([name, star]) => {
    const element = STAR_ELEMENTS[star] || birthElement;
    return {
      name,
      star,
      element,
      meaning: TRANSFORM_MEANINGS[name],
      plainMeaning: TRANSFORM_PLAIN_TEXT[name],
      starMeaning: STAR_PLAIN_TEXT[star],
      relation: elementRelation(day.element, element)
    };
  });
  const birthday = lunarBirthdayProfile(lunarMonth, lunarDay, day.element);
  const birthHourProfile = onePillarHourProfile(birthHour, day.element);
  const mainStar = calculateMainStar(stem, lunarMonth, lunarDay, birthHour);
  const topic = chooseOnePillarTopic(primaryRelation, transforms, birthday, birthHourProfile, mainStar);
  return {
    stem,
    birthElement,
    day,
    primaryRelation,
    transforms,
    birthday,
    birthHour: birthHourProfile,
    mainStar,
    topic,
    lifePattern: onePillarLifePattern(transforms),
    correction: onePillarCorrection(transforms, topic, birthday, birthHourProfile, mainStar),
    recommendations: onePillarRecommendations(topic)
  };
}

function calculateMainStar(stem, lunarMonth, lunarDay, birthHour) {
  if (!birthHour) return null;
  const monthIndex = LUNAR_MONTHS.indexOf(lunarMonth);
  const hourIndex = EARTHLY_BRANCHES.indexOf(birthHour);
  if (monthIndex < 0 || hourIndex < 0) return null;

  const soulIndex = fixIndex(monthIndex - hourIndex, 12);
  const palaceBranch = PALACE_BRANCHES[soulIndex];
  const yinStem = YIN_PALACE_STEMS[stem] || YIN_PALACE_STEMS.辛;
  const palaceStem = HEAVENLY_STEMS[fixIndex(HEAVENLY_STEMS.indexOf(yinStem) + soulIndex, 10)];
  const fiveElementClass = fiveElementClassOf(palaceStem, palaceBranch);
  const dayNumber = lunarDayNumber(lunarDay);
  const offset = majorStarOffset(dayNumber, fiveElementClass.value);
  let ziweiIndex = Math.floor((dayNumber + offset) / fiveElementClass.value) % 12 - 1;
  ziweiIndex = offset % 2 === 0 ? ziweiIndex + offset : ziweiIndex - offset;
  ziweiIndex = fixIndex(ziweiIndex, 12);
  const tianfuIndex = fixIndex(12 - ziweiIndex, 12);
  const palaces = Array.from({ length: 12 }, () => []);
  ZIWEI_MAJOR_STARS.forEach((star, index) => {
    if (star) palaces[fixIndex(ziweiIndex - index, 12)].push(star);
  });
  TIANFU_MAJOR_STARS.forEach((star, index) => {
    if (star) palaces[fixIndex(tianfuIndex + index, 12)].push(star);
  });

  const stars = palaces[soulIndex] || [];
  const name = stars.join('、') || '命宮無十四主星';
  const primaryStar = stars[0] || '';
  const profile = MAIN_STAR_PROFILES[primaryStar] || null;
  const meaning = stars.length
    ? stars.map((star) => STAR_PLAIN_TEXT[star]).filter(Boolean).join('；')
    : '命宮未落入十四主星，第一版暫不借對宮，先以生年四化與今日修心判斷。';
  const description = MAIN_STAR_DESCRIPTIONS[primaryStar] || `${name}偏向${meaning}。第一版先依命宮主星、生年四化、今日五行與生日時辰共同判斷，不作絕對吉凶，只提醒今天最容易從哪個習氣處用力，以及適合修哪一念。`;
  return {
    name,
    stars,
    primaryStar,
    profile,
    meaning,
    description,
    soulIndex,
    palaceStem,
    palaceBranch,
    palaceLabel: `${palaceStem}${palaceBranch}命宮`,
    fiveElementClass: fiveElementClass.label,
    fiveElementValue: fiveElementClass.value,
    ziweiPalace: PALACE_BRANCHES[ziweiIndex],
    tianfuPalace: PALACE_BRANCHES[tianfuIndex]
  };
}

function lunarDayNumber(lunarDay) {
  const index = LUNAR_DAYS.indexOf(lunarDay);
  return index >= 0 ? index + 1 : 1;
}

function fiveElementClassOf(palaceStem, palaceBranch) {
  let number = (STEM_CLASS_NUMBERS[palaceStem] || 4) + (BRANCH_CLASS_NUMBERS[palaceBranch] || 1);
  if (number > 5) number -= 5;
  return FIVE_ELEMENT_CLASSES[number] || FIVE_ELEMENT_CLASSES[2];
}

function majorStarOffset(dayNumber, fiveElementValue) {
  for (let offset = 0; offset < fiveElementValue; offset += 1) {
    if ((dayNumber + offset) % fiveElementValue === 0) return offset;
  }
  return 0;
}

function fixIndex(index, mod = 12) {
  return ((index % mod) + mod) % mod;
}

function parseYearStem(value) {
  const text = (value || '').normalize('NFKC');
  const writtenStem = HEAVENLY_STEMS.find((stem) => text.includes(stem));
  if (writtenStem) return writtenStem;
  const year = parseGregorianYear(text);
  return year ? sexagenaryYearFromGregorian(year).stem : '';
}

function parseGregorianYear(value) {
  const text = (value || '').normalize('NFKC');
  const match = text.match(/(?:西元)?\s*(19\d{2}|20\d{2}|21\d{2})/);
  return match ? Number(match[1]) : 0;
}

function sexagenaryYearFromGregorian(year) {
  const index = ((Number(year) - 4) % 60 + 60) % 60;
  const stem = HEAVENLY_STEMS[index % 10];
  const branch = EARTHLY_BRANCHES[index % 12];
  return {
    stem,
    branch,
    label: `${stem}${branch}年`,
    element: STEM_ELEMENTS[stem],
    index
  };
}

function lunarBirthdayProfile(lunarMonth, lunarDay, todayElement) {
  const month = LUNAR_MONTH_PROFILES[lunarMonth] || LUNAR_MONTH_PROFILES.正月;
  const dayNumber = Math.max(1, LUNAR_DAYS.indexOf(lunarDay) + 1);
  const phase = LUNAR_DAY_PHASES.find((item) => dayNumber <= item.max) || LUNAR_DAY_PHASES[LUNAR_DAY_PHASES.length - 1];
  const monthRelation = elementRelation(todayElement, month.element);
  return {
    month: lunarMonth,
    day: lunarDay,
    monthElement: month.element,
    monthLabel: month.label,
    monthTopic: month.topic,
    monthSummary: month.summary,
    phaseLabel: phase.label,
    phaseTopic: phase.topic,
    phaseSummary: phase.summary,
    monthRelation,
    summary: `${lunarMonth}偏${month.label}，${lunarDay}屬${phase.label}；${month.summary}${phase.summary}`
  };
}

function onePillarHourProfile(birthHour, todayElement) {
  const hour = LUNAR_HOURS.find((item) => item.value === birthHour) || LUNAR_HOURS[0];
  if (!hour.value) return { ...hour, relation: null };
  const relation = elementRelation(todayElement, hour.element);
  return {
    ...hour,
    relation,
    summary: `${hour.label}偏${hour.element}氣；${hour.summary}今日與天地之氣形成${relation.label}。`
  };
}

function sexagenaryDay(date) {
  const jdn = julianDayNumber(date);
  const index = ((jdn + 49) % 60 + 60) % 60;
  const stem = HEAVENLY_STEMS[index % 10];
  const branch = EARTHLY_BRANCHES[index % 12];
  return {
    stem,
    branch,
    label: `${stem}${branch}日`,
    element: STEM_ELEMENTS[stem],
    index
  };
}

function formatMonthDay(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function julianDayNumber(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + (12 * a) - 3;
  return day + Math.floor(((153 * m) + 2) / 5) + (365 * y) + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function elementRelation(source, target) {
  if (source === target) {
    return {
      type: 'same',
      label: `${source}${target}同氣`,
      summary: '同氣相扶，適合穩住節奏，但也要防固執。'
    };
  }
  if (ELEMENT_GENERATES[source] === target) {
    return {
      type: 'sourceGeneratesTarget',
      label: `${source}生${target}`,
      summary: '今日有助力，適合整理資源、建立秩序、完成手邊事。'
    };
  }
  if (ELEMENT_CONTROLS[source] === target) {
    return {
      type: 'sourceControlsTarget',
      label: `${source}剋${target}`,
      summary: '今日壓力較明顯，容易急躁、口舌或衝突，宜先忍辱。'
    };
  }
  if (ELEMENT_GENERATES[target] === source) {
    return {
      type: 'targetGeneratesSource',
      label: `${target}生${source}`,
      summary: '今日容易耗神外放，宜節制精神與時間。'
    };
  }
  return {
    type: 'targetControlsSource',
    label: `${target}剋${source}`,
    summary: '今日需要承擔與校正，宜謙卑請益、慢慢處理。'
  };
}

function chooseOnePillarTopic(primaryRelation, transforms, birthday, birthHour, mainStar) {
  const scores = new Map();
  const reasons = new Map();
  const addScore = (key, value, reason) => {
    if (!key || !ONE_PILLAR_TOPIC_RULES[key]) return;
    scores.set(key, (scores.get(key) || 0) + value);
    const list = reasons.get(key) || [];
    list.push(reason);
    reasons.set(key, list);
  };

  addScore(RELATION_TOPIC_KEYS[primaryRelation.type], 4, `今日天地作用為${primaryRelation.label}`);
  addScore(birthday.monthTopic, 1.6, `農曆月氣偏${birthday.monthLabel}`);
  addScore(birthday.phaseTopic, 1.6, `農曆日位屬${birthday.phaseLabel}`);
  addScore(RELATION_TOPIC_KEYS[birthday.monthRelation.type], 1.2, `今日氣觸動生日月氣：${birthday.monthRelation.label}`);
  if (birthHour?.topic) addScore(birthHour.topic, 1.4, `出生時辰偏${birthHour.branch}時${birthHour.element}氣`);
  if (birthHour?.relation) addScore(RELATION_TOPIC_KEYS[birthHour.relation.type], 0.9, `今日氣觸動時辰：${birthHour.relation.label}`);
  if (mainStar?.profile?.topic) addScore(mainStar.profile.topic, 1.8, `命宮主星${mainStar.name}偏${mainStar.profile.topic}`);

  const ji = transforms.find((item) => item.name === '化忌');
  if (ji && ['same', 'sourceControlsTarget', 'targetControlsSource'].includes(ji.relation.type)) {
    addScore(primaryRelation.type === 'sourceControlsTarget' ? '忍辱' : '放下', 5, `化忌${ji.star}今日被觸動`);
  }
  if (ji && ji.relation.type === 'sourceGeneratesTarget') {
    addScore('放下', 2.2, `化忌${ji.star}今日被助長，容易執著細節`);
  }

  const lu = transforms.find((item) => item.name === '化祿');
  if (lu && ['same', 'sourceGeneratesTarget'].includes(lu.relation.type)) {
    addScore('整理', 1.4, `化祿${lu.star}今日得氣`);
  }

  const [topicKey = '守中'] = [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))[0] || [];
  const topic = ONE_PILLAR_TOPIC_RULES[topicKey] || ONE_PILLAR_TOPIC_RULES.守中;
  return {
    ...topic,
    key: topicKey,
    reasonText: (reasons.get(topicKey) || ['今日整體氣勢較適合守中']).slice(0, 3).join('、')
  };
}

function onePillarLifePattern(transforms) {
  const lu = transforms.find((item) => item.name === '化祿');
  const quan = transforms.find((item) => item.name === '化權');
  const ke = transforms.find((item) => item.name === '化科');
  const ji = transforms.find((item) => item.name === '化忌');
  return `先天資糧在${lu?.star || '化祿'}，行動模式看${quan?.star || '化權'}，智慧整理看${ke?.star || '化科'}，今天最要留意${ji?.star || '化忌'}所代表的執著。`;
}

function onePillarCorrection(transforms, topic, birthday, birthHour, mainStar) {
  const ji = transforms.find((item) => item.name === '化忌');
  const lu = transforms.find((item) => item.name === '化祿');
  if (ji && ['same', 'sourceControlsTarget', 'targetControlsSource'].includes(ji.relation.type)) {
    return `化忌在${ji.star}被今日${ji.relation.label}觸動，先修${topic.title}，少從執著處用力。`;
  }
  if (ji && ji.relation.type === 'sourceGeneratesTarget') {
    return `今日氣勢助長化忌${ji.star}，容易把標準、細節或想法抓太緊，要用${topic.title}鬆開。`;
  }
  if (lu && ['same', 'sourceGeneratesTarget'].includes(lu.relation.type)) {
    return `化祿在${lu.star}得氣，今日有助力，但仍以${topic.title}守住分寸。`;
  }
  if (birthHour?.topic === topic.key) {
    return `出生時辰也偏向${topic.title}，今天這個功課會更明顯。`;
  }
  if (mainStar?.profile?.topic === topic.key) {
    return `命宮主星${mainStar.name}也偏向${topic.title}，今天這個功課會更貼近本命習氣。`;
  }
  if (birthday.monthTopic === topic.key || birthday.phaseTopic === topic.key) {
    return `農曆生日也偏向${topic.title}，今天這個功課會比較明顯。`;
  }
  return `今日不以吉凶論斷，重點是用${topic.title}調整身心。`;
}

function onePillarTransformTodayText(item) {
  if (item.name === '化忌' && item.relation.type === 'sourceGeneratesTarget') {
    return `今天會把這個課題放大，容易想講清楚、想證明、想抓住標準，宜先放鬆。`;
  }
  if (item.name === '化忌' && ['same', 'sourceControlsTarget', 'targetControlsSource'].includes(item.relation.type)) {
    return `今天容易碰到這個執著點，先不要硬推，回到修心。`;
  }
  if (item.relation.type === 'sourceGeneratesTarget') {
    return `今天這個面向會比較有力，可以善用，但不要貪多。`;
  }
  if (item.relation.type === 'sourceControlsTarget') {
    return `今天這個面向容易受壓，宜放慢，不急著證明。`;
  }
  if (item.relation.type === 'targetGeneratesSource') {
    return `今天容易在這個面向耗神，宜保留力氣。`;
  }
  if (item.relation.type === 'targetControlsSource') {
    return `今天容易想掌控這個面向，宜謙卑校正。`;
  }
  return `今天同氣相應，這個面向會比較明顯，宜穩住分寸。`;
}

function onePillarRecommendations(topic) {
  const keywords = topic.keywords || [];
  const scored = posts
    .map((post) => ({ post, score: onePillarArticleScore(post, keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.post.timestamp || 0) - Number(a.post.timestamp || 0));
  const unique = [];
  for (const item of scored) {
    if (unique.some((entry) => entry.post.id === item.post.id)) continue;
    unique.push({
      post: item.post,
      label: `主修${topic.title}`,
      reason: topic.articleReason || `今日主修${topic.title}，推薦閱讀這篇文章作為功課。`
    });
    if (unique.length >= 3) break;
  }
  return unique;
}

function onePillarArticleScore(post, keywords) {
  const title = normalizeSearch(post.title || '');
  const body = normalizeSearch(post.body || '');
  const tags = normalizeSearch((post.tags || []).join('\n'));
  const series = normalizeSearch(postSeriesNames(post).join('\n'));
  let score = 0;
  for (const keyword of keywords) {
    const token = normalizeSearch(keyword);
    if (!token) continue;
    if (title.includes(token)) score += 8;
    if (series.includes(token)) score += 6;
    if (tags.includes(token)) score += 4;
    if (body.includes(token)) score += 1;
  }
  if (post.series === '龍門心法') score += 2;
  if (post.series === '重陽立教十五論') score += 2;
  if (post.category === '修心煉性' || post.category === '修身養性') score += 2;
  return score;
}

function render() {
  const filtered = matchPosts();
  const selected = selectedPost(filtered);
  document.body.classList.toggle('is-reading-article', Boolean(selected));
  document.body.classList.toggle('is-filtered-list', hasActiveFilter());
  renderSummary(filtered);
  renderSeries();
  renderCategories();
  renderStats(filtered);
  renderPosts(filtered, selected);
  renderReader(selected);
  yearSelect.value = state.year;
  if (seriesSelect) seriesSelect.value = state.series;
  sortSelect.value = currentSortOrder();
  sortSelect.disabled = state.series !== '全部系列';
}

function matchPosts() {
  const tokens = searchTokens(state.query);
  return posts
    .filter((post) => state.category === '全部' || post.category === state.category)
    .filter((post) => state.year === '全部年份' || post.date?.startsWith(state.year))
    .filter((post) => state.series === '全部系列' || postHasSeries(post, state.series))
    .filter((post) => !state.pillar || pillarScore(post, state.pillar) > 0)
    .filter((post) => {
      if (!tokens.length) return true;
      const text = [
        post.title,
        post.body,
        post.category,
        ...postSeriesNames(post),
        post.date,
        ...(post.tags || [])
      ].join('\n');
      const haystack = normalizeSearch(text);
      return tokens.every((token) => haystack.includes(token));
    })
    .sort((a, b) => {
      if (state.pillar) {
        const scoreDiff = pillarScore(b, state.pillar) - pillarScore(a, state.pillar);
        if (scoreDiff) return scoreDiff;
      }
      return currentSortOrder() === 'oldest' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });
}

function currentSortOrder() {
  return state.series === '全部系列' ? state.sort : SERIES_SORT;
}

function renderSummary(filtered) {
  if (!posts.length) {
    summary.textContent = '尚未匯入文章';
    return;
  }
  const images = archiveMeta.publicImages || 0;
  summary.textContent = `已整理 ${formatCount(posts.length)} 篇公開文字文章、${formatCount(images)} 張文章圖片，分為 ${formatCount(CATEGORY_ORDER.length)} 個主題；目前符合 ${formatCount(filtered.length)} 篇。`;
}

function renderSeries() {
  const series = seriesNames;
  seriesBar.replaceChildren(...series.map((seriesName) => {
    const button = document.createElement('button');
    button.type = 'button';
    const count = seriesCounts.get(seriesName) || 0;
    button.append(filterLabel(seriesDisplayName(seriesName), count));
    button.setAttribute('aria-pressed', String(state.series === seriesName));
    button.setAttribute('aria-label', `${seriesDisplayName(seriesName)}，${formatCount(count)} 篇`);
    button.addEventListener('click', () => selectSeries(seriesName));
    return button;
  }));
}

function renderCategories() {
  const extraCategories = [...categoryCounts.keys()].filter((category) => !CATEGORY_ORDER.includes(category));
  const categories = ['全部', ...CATEGORY_ORDER, ...extraCategories];
  categoryBar.replaceChildren(...categories.map((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    const count = category === '全部' ? posts.length : categoryCounts.get(category) || 0;
    button.append(filterLabel(category, count));
    button.setAttribute('aria-pressed', String(state.category === category));
    button.setAttribute('aria-label', `${category}，${formatCount(count)} 篇`);
    button.addEventListener('click', () => {
      state.category = category;
      state.series = '全部系列';
      state.pillar = '';
      state.year = '全部年份';
      state.visible = PAGE_SIZE;
      state.selectedId = null;
      render();
      trackEvent('filter_category', {
        category_name: category,
        result_count: matchPosts().length
      });
      scrollToResultsOnMobile();
    });
    return button;
  }));
}

function filterLabel(label, count) {
  const fragment = document.createDocumentFragment();
  const name = document.createElement('span');
  name.className = 'filter-label';
  name.textContent = label;
  const number = document.createElement('span');
  number.className = 'filter-count';
  number.textContent = formatCount(count);
  fragment.append(name, number);
  return fragment;
}

function seriesDisplayName(seriesName) {
  return SERIES_DISPLAY_NAMES[seriesName] || seriesName;
}

function hasActiveFilter() {
  return Boolean(
    state.query ||
    state.pillar ||
    state.category !== '全部' ||
    state.year !== '全部年份' ||
    state.series !== '全部系列'
  );
}

function renderStats(filtered) {
  const linkCount = posts.reduce((sum, post) => sum + (post.links || []).length, 0);
  const mediaCount = archiveMeta.publicImages || posts.reduce((sum, post) => sum + (post.media || []).length, 0);
  stats.replaceChildren(
    statLine('公開文章', formatCount(posts.length)),
    statLine('符合條件', formatCount(filtered.length)),
    statLine('分類數', formatCount(CATEGORY_ORDER.length)),
    statLine('系列數', formatCount(seriesCounts.size)),
    statLine('最早日期', earliestPost?.date || '-'),
    statLine('最新日期', latestPost?.date || '-'),
    statLine('保留連結', formatCount(linkCount)),
    statLine('公開圖片', formatCount(mediaCount))
  );
}

function renderPosts(filtered, selected) {
  const visiblePosts = filtered.slice(0, state.visible);
  const currentTitle = state.series !== '全部系列'
    ? seriesDisplayName(state.series)
    : state.pillar
      ? state.pillar
      : state.category === '全部'
        ? '全部文章'
        : state.category;
  resultTitle.textContent = currentTitle;
  resultMeta.textContent = filtered.length
    ? `顯示 ${formatCount(visiblePosts.length)} / ${formatCount(filtered.length)} 篇`
    : '0 篇';

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = '沒有符合條件的文章';
    postList.replaceChildren(empty);
    loadMoreButton.hidden = true;
    return;
  }

  postList.replaceChildren(...visiblePosts.map((post) => postCard(post, selected)));
  loadMoreButton.hidden = visiblePosts.length >= filtered.length;
}

function postCard(post, selected) {
  const node = template.content.firstElementChild.cloneNode(true);
  const isSelected = selected?.id === post.id;
  node.dataset.postId = post.id;
  node.setAttribute('aria-current', String(isSelected));
  node.querySelector('time').textContent = post.date;
  node.querySelector('.category').textContent = post.category || '未分類';
  appendSeriesBadges(node.querySelector('.post-meta'), post, true);
  node.querySelector('h2').textContent = post.title;
  node.querySelector('.excerpt').textContent = state.unlocked
    ? excerpt(post.body)
    : publicExcerpt(post.body);
  const tags = node.querySelector('.tags');
  const tagNodes = (post.tags || []).slice(0, 6).map((tag) => {
    const item = document.createElement('li');
    item.textContent = tag;
    return item;
  });
  if ((post.media || []).length) {
    const mediaBadge = document.createElement('li');
    mediaBadge.className = 'media-badge';
    mediaBadge.textContent = `圖片 ${formatCount(post.media.length)}`;
    tagNodes.push(mediaBadge);
  }
  tags.replaceChildren(...tagNodes);
  const actions = document.createElement('div');
  actions.className = 'post-card-actions';
  actions.append(articleShareButton(post, {
    className: 'post-share-button',
    successLabel: '網址已複製'
  }));
  node.append(actions);
  node.addEventListener('click', () => selectPost(post.id, 'post_list'));
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectPost(post.id, 'post_list_keyboard');
    }
  });
  return node;
}

function renderReader(post) {
  if (!post) {
    renderHourlyRecommendation();
    return;
  }

  if (!state.unlocked) {
    renderLockedReader(post);
    return;
  }

  const header = document.createElement('header');
  header.className = 'reader-head';
  const meta = document.createElement('div');
  meta.className = 'post-meta reader-meta';
  const time = document.createElement('time');
  time.textContent = post.date;
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = post.category || '未分類';
  meta.append(time, category);
  appendSeriesBadges(meta, post, true);
  const title = document.createElement('h2');
  title.textContent = post.title;
  header.append(meta, title, readerActions(post, { includeText: true }));

  const body = document.createElement('div');
  body.className = 'reader-body';
  body.replaceChildren(...paragraphBlocks(post.body).map((block) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = block;
    return paragraph;
  }));

  const details = document.createElement('dl');
  details.className = 'reader-details';
  details.append(
    detailItem('文章 ID', post.id),
    detailItem('系列', postSeriesNames(post).map((seriesName) => seriesLabel(post, seriesName)).join('、') || '-'),
    detailItem('原附件數', formatCount(post.mediaCount || 0)),
    detailItem('文章網址', publicArticleUrl(post))
  );

  const sections = [header];
  const media = renderMedia(post);
  if (media) sections.push(media);
  sections.push(body);
  if ((post.links || []).length) sections.push(linkList(post.links));
  if ((post.tags || []).length) sections.push(tagList(post.tags));
  const recommendations = renderReaderRecommendations(post);
  if (recommendations) sections.push(recommendations);
  sections.push(details);
  reader.replaceChildren(...sections);
}

function renderHourlyRecommendation() {
  const recommendation = hourlyRecommendation();
  if (!recommendation) {
    const empty = document.createElement('p');
    empty.className = 'empty reader-empty';
    empty.textContent = '尚未匯入文章';
    reader.replaceChildren(empty);
    return;
  }

  const section = document.createElement('section');
  section.className = 'hourly-pick';

  const header = document.createElement('header');
  header.className = 'hourly-pick-head';
  const kicker = document.createElement('p');
  kicker.className = 'eyebrow';
  kicker.textContent = '目前有人在讀';
  const title = document.createElement('h2');
  title.textContent = recommendation.title;
  const meta = document.createElement('div');
  meta.className = 'post-meta reader-meta';
  const time = document.createElement('time');
  time.textContent = recommendation.date;
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = recommendation.category || '未分類';
  meta.append(time, category);
  appendSeriesBadges(meta, recommendation, true);
  header.append(kicker, title, meta);

  const preview = document.createElement('div');
  preview.className = 'hourly-pick-preview';
  preview.replaceChildren(...paragraphBlocks(publicPreview(recommendation.body)).map((block) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = block;
    return paragraph;
  }));

  const actions = document.createElement('div');
  actions.className = 'reader-actions';
  const readButton = document.createElement('button');
  readButton.type = 'button';
  readButton.textContent = '閱讀這篇';
  readButton.addEventListener('click', () => openRecommendedPost(recommendation.id));
  actions.append(readButton);

  const note = document.createElement('p');
  note.className = 'hourly-pick-note';
  note.textContent = '本時段推薦文章；完整內文需輸入已登記道名。';

  section.append(header, preview, actions, note);
  reader.replaceChildren(section);
}

function renderLockedReader(post) {
  const header = document.createElement('header');
  header.className = 'reader-head';
  const meta = document.createElement('div');
  meta.className = 'post-meta reader-meta';
  const time = document.createElement('time');
  time.textContent = post.date;
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = post.category || '未分類';
  meta.append(time, category);
  appendSeriesBadges(meta, post, true);
  const title = document.createElement('h2');
  title.textContent = post.title;
  header.append(meta, title, readerActions(post, { includeText: false }));

  const preview = document.createElement('section');
  preview.className = 'public-preview';
  const previewHeading = document.createElement('h3');
  previewHeading.textContent = '公開預覽 約 50%';
  const previewBody = document.createElement('div');
  previewBody.className = 'reader-body';
  previewBody.replaceChildren(...paragraphBlocks(publicPreview(post.body)).map((block) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = block;
    return paragraph;
  }));
  preview.append(previewHeading, previewBody);
  const publicMedia = renderPublicMedia(post);

  const panel = document.createElement('form');
  panel.className = 'unlock-panel';
  const label = document.createElement('label');
  label.className = 'field unlock-field';
  const labelText = document.createElement('span');
  labelText.textContent = '道名';
  const input = document.createElement('input');
  input.type = 'text';
  input.lang = 'zh-Hant';
  input.inputMode = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  input.placeholder = '請輸入道名';
  label.append(labelText, input);

  const hint = document.createElement('p');
  hint.textContent = '與林明心道長登記後，\n輸入您的道名，正確後即可閱讀全文。';

  const error = document.createElement('p');
  error.className = 'unlock-error';
  error.hidden = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = '開啟文章';

  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    const matchedPhrase = SECRET_PHRASES.find((phrase) => normalizeSecret(phrase) === normalizeSecret(input.value));
    if (!matchedPhrase) {
      error.textContent = '道名不正確，請再確認。';
      error.hidden = false;
      input.select();
      return;
    }
    state.unlocked = true;
    writeUnlockState();
    trackArticleUnlock(post, matchedPhrase);
    render();
  });

  const recommendations = renderReaderRecommendations(post);
  panel.append(hint, label, error, button);
  reader.replaceChildren(...[header, preview, publicMedia, panel, recommendations].filter(Boolean));
}

function renderReaderRecommendations(post) {
  const active = currentReadingRecommendation(post);
  const related = seriesRecommendations(post, active?.post?.id);
  if (!active && !related.length) return null;

  const section = document.createElement('section');
  section.className = 'reader-discovery';

  if (active) {
    section.append(recommendationBlock('目前有人在讀', [active], '本時段推薦文章'));
  }

  if (related.length) {
    section.append(recommendationBlock('同系列接著讀', related, '依系列順序推薦'));
  }

  return section;
}

function recommendationBlock(title, items, subtitle) {
  const block = document.createElement('section');
  block.className = 'recommendation-block';
  const header = document.createElement('header');
  header.className = 'recommendation-head';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const note = document.createElement('p');
  note.textContent = subtitle;
  header.append(heading, note);

  const list = document.createElement('div');
  list.className = 'recommendation-list';
  list.replaceChildren(...items.map(({ post, label }) => recommendationRow(post, label)));
  block.append(header, list);
  return block;
}

function recommendationRow(post, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'recommendation-row';
  button.addEventListener('click', () => openRecommendedPost(post.id, 'reader_recommendation'));

  const labelNode = document.createElement('span');
  labelNode.className = 'recommendation-label';
  labelNode.textContent = label;
  const title = document.createElement('strong');
  title.textContent = recommendationTitle(post);
  const meta = document.createElement('span');
  meta.className = 'recommendation-meta';
  const seriesText = postSeriesNames(post).map((seriesName) => seriesDisplayName(seriesName)).join('、');
  meta.textContent = [post.date, seriesText || post.category || '道語'].filter(Boolean).join(' · ');
  const preview = document.createElement('span');
  preview.className = 'recommendation-excerpt';
  preview.textContent = publicExcerpt(post.body);

  button.append(labelNode, title, meta, preview);
  return button;
}

function recommendationTitle(post) {
  const title = post.title || '未命名文章';
  const lines = (post.body || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const detail = lines.find((line) => {
    if (line === title) return false;
    if (/^(原文|內容解讀|書店老闆筆記|⸻)/.test(line)) return false;
    return line.length >= 4 && line.length <= 42;
  });
  if (!detail) return title;
  const compactTitle = title.replace(/[，,。！？!?；;：:、\s]+$/, '');
  if (compactTitle.includes(detail)) return title;
  if (/^書店老闆讀|^《[^》]+》$/.test(compactTitle)) return `${compactTitle}｜${detail}`;
  return title;
}

function renderMedia(post) {
  const media = (post.media || []).filter((item) => item?.src);
  if (!media.length) return null;
  return mediaSection(post, media, `文章圖片 ${formatCount(media.length)} 張`, 'reader-media');
}

function renderPublicMedia(post) {
  const media = publicPhotoMedia(post);
  if (!media.length) return null;
  return mediaSection(post, media, `公開照片 ${formatCount(media.length)} 張`, 'reader-media reader-public-media');
}

function mediaSection(post, media, headingText, className) {
  const section = document.createElement('section');
  section.className = className;
  const heading = document.createElement('h3');
  heading.textContent = headingText;
  const grid = document.createElement('div');
  grid.className = 'media-grid';
  grid.replaceChildren(...media.map((item, index) => {
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'media-link';
    link.setAttribute('aria-label', `放大 ${post.title} 圖片 ${index + 1}`);
    const image = document.createElement('img');
    image.src = item.src;
    image.alt = `${post.title} 圖片 ${index + 1}`;
    image.loading = 'lazy';
    link.addEventListener('click', () => openImageLightbox(item.src, image.alt, link));
    link.append(image);
    return link;
  }));
  section.append(heading, grid);
  return section;
}

function publicPhotoMedia(post) {
  if (hasSensitiveMediaContext(post) && !hasPublicPhotoContext(post)) return [];
  return (post.media || []).filter((item) => item?.src).slice(0, PUBLIC_MEDIA_LIMIT);
}

function readerActions(post, options = {}) {
  const includeText = options.includeText !== false;
  const actions = document.createElement('div');
  actions.className = 'reader-actions';
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'reader-search-button';
  searchButton.textContent = '回到搜尋';
  searchButton.addEventListener('click', returnToSearch);

  const shareButton = articleShareButton(post, {
    className: 'reader-share-button',
    label: '複製網址',
    successLabel: '已複製網址'
  });

  actions.append(searchButton, shareButton);
  if (!includeText) return actions;

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.textContent = '複製文字';
  copyButton.addEventListener('click', async () => {
    const ok = await copyText(`${post.title}\n\n${post.body}`.trim());
    copyButton.textContent = ok ? '已複製' : '複製失敗';
    trackArticleEvent(ok ? 'copy_article_text' : 'copy_article_text_failed', post);
    setTimeout(() => { copyButton.textContent = '複製文字'; }, COPY_FEEDBACK_DELAY);
  });
  actions.append(copyButton);
  return actions;
}

function articleShareButton(post, options = {}) {
  const button = document.createElement('button');
  const label = options.label || '複製網址';
  button.type = 'button';
  button.className = options.className || '';
  button.textContent = label;
  button.addEventListener('click', async (event) => {
    event.stopPropagation();
    const ok = await copyText(publicArticleUrl(post));
    button.textContent = ok ? (options.successLabel || '已複製') : '複製失敗';
    trackArticleEvent(ok ? 'copy_article_url' : 'copy_article_url_failed', post);
    setTimeout(() => { button.textContent = label; }, COPY_FEEDBACK_DELAY);
  });
  button.addEventListener('keydown', (event) => {
    event.stopPropagation();
  });
  return button;
}

function linkList(links) {
  const section = document.createElement('section');
  section.className = 'link-section';
  const heading = document.createElement('h3');
  heading.textContent = '文章連結';
  const list = document.createElement('ul');
  list.replaceChildren(...links.map((href) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = href;
    link.rel = 'noreferrer';
    item.append(link);
    return item;
  }));
  section.append(heading, list);
  return section;
}

function tagList(tags) {
  const list = document.createElement('ul');
  list.className = 'tags reader-tags';
  list.replaceChildren(...tags.map((tag) => {
    const item = document.createElement('li');
    item.textContent = tag;
    return item;
  }));
  return list;
}

function selectPost(id, source = 'post_list') {
  blurActiveControl();
  state.selectedId = id;
  render();
  const post = posts.find((item) => item.id === id);
  trackArticleEvent('select_article', post, { source });
  if (window.matchMedia('(max-width: 860px)').matches) reader.scrollIntoView({ block: 'start' });
}

function openRecommendedPost(id, source = 'hourly_recommendation') {
  blurActiveControl();
  state.category = '全部';
  state.year = '全部年份';
  state.series = '全部系列';
  state.pillar = '';
  state.query = '';
  state.visible = PAGE_SIZE;
  state.selectedId = id;
  searchInput.value = '';
  render();
  trackArticleEvent(
    source === 'hourly_recommendation' ? 'select_hourly_recommendation' : 'select_reader_recommendation',
    posts.find((post) => post.id === id),
    { source }
  );
  reader.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function returnToSearch() {
  state.selectedId = null;
  render();
  trackEvent('return_to_search');
  document.querySelector('.masthead')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  searchInput.focus({ preventScroll: true });
}

function blurActiveControl() {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.matches('input, textarea, select, button')) active.blur();
}

function openImageLightbox(src, alt, trigger = null) {
  if (!courseFrameworkLightbox || !courseFrameworkLightboxImage || !src) return;
  activeLightboxTrigger = trigger;
  courseFrameworkLightboxImage.src = src;
  courseFrameworkLightboxImage.alt = alt || '放大圖片';
  courseFrameworkLightbox.hidden = false;
  document.body.classList.add('has-open-lightbox');
  trackEvent('open_image_lightbox', {
    image_alt: alt || '放大圖片',
    image_src: src
  });
  courseFrameworkClose?.focus({ preventScroll: true });
}

function closeImageLightbox() {
  if (!courseFrameworkLightbox) return;
  courseFrameworkLightbox.hidden = true;
  document.body.classList.remove('has-open-lightbox');
  const focusTarget = activeLightboxTrigger?.isConnected ? activeLightboxTrigger : courseFrameworkOpen;
  activeLightboxTrigger = null;
  focusTarget?.focus({ preventScroll: true });
}

function trackArticleUnlock(post, phrase) {
  trackArticleEvent('unlock_article_success', post, {
    event_label: `道名成功開啟文章（${phrase}）`,
    dao_name: phrase
  });
}

function bindAnalyticsLinks() {
  document.querySelectorAll('.course-order-button, .course-order-image-link').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('course_signup_click', {
        link_text: link.textContent.trim() || link.querySelector('img')?.alt || '圓安丹道入門線上試播課',
        link_url: link.href
      });
    });
  });

  document.querySelectorAll('.yuanan-ip-button, .yuanan-ip-image').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('facebook_join_click', {
        link_text: link.textContent.trim() || link.querySelector('img')?.alt || '圓安道長 Facebook',
        link_url: link.href
      });
    });
  });
}

function scheduleSearchTracking(source) {
  window.clearTimeout(searchTrackTimer);
  if (!state.query) return;
  searchTrackTimer = window.setTimeout(() => {
    trackEvent('site_search', {
      search_term: state.query,
      source,
      result_count: matchPosts().length
    });
  }, SEARCH_TRACK_DELAY);
}

function trackArticleEvent(name, post, params = {}) {
  if (!post) return;
  trackEvent(name, {
    article_title: post.title || '未命名文章',
    article_url: publicArticleUrl(post),
    article_id: post.id || '',
    article_category: post.category || '',
    article_series: postSeriesNames(post).join('、'),
    ...params
  });
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, {
    page_title: document.title,
    ...params
  });
}

function publicArticleUrl(post) {
  if (!post?.id) return SITE_URL;
  return `${SITE_URL}/articles/${post.id}.html`;
}

function hasPublicPhotoContext(post) {
  const text = `${post.title || ''}\n${post.body || ''}\n${post.category || ''}\n${(post.tags || []).join('\n')}`;
  return PUBLIC_PHOTO_KEYWORDS.some((keyword) => text.includes(keyword));
}

function hasSensitiveMediaContext(post) {
  const text = `${post.title || ''}\n${post.body || ''}\n${post.category || ''}\n${(post.tags || []).join('\n')}`;
  return SENSITIVE_MEDIA_KEYWORDS.some((keyword) => text.includes(keyword));
}

function hourlyRecommendation() {
  if (!posts.length) return null;
  const candidates = posts.filter((post) => (post.body || '').replace(/\s+/g, '').length >= RECOMMENDATION_MIN_LENGTH);
  const pool = candidates.length ? candidates : posts;
  return pool[(state.recommendationHour * 37) % pool.length];
}

function currentReadingRecommendation(post) {
  const pool = recommendationPool(post);
  const candidates = pool.filter((item) => item.id !== post.id);
  if (!candidates.length) {
    const fallback = hourlyRecommendation();
    return fallback && fallback.id !== post.id ? { post: fallback, label: '本時段推薦' } : null;
  }
  const index = seededIndex(`${post.id}-${state.recommendationHour}`, candidates.length);
  return { post: candidates[index], label: '同修正在讀' };
}

function seriesRecommendations(post, excludedId = '') {
  const seriesName = post.series || postSeriesNames(post)[0];
  if (!seriesName) return [];

  const seriesPosts = posts
    .filter((item) => postHasSeries(item, seriesName))
    .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
  const currentIndex = seriesPosts.findIndex((item) => item.id === post.id);
  if (currentIndex < 0) return [];

  const recommendations = [];
  const add = (item, label) => {
    if (!item || item.id === post.id || item.id === excludedId || recommendations.some((entry) => entry.post.id === item.id)) return;
    recommendations.push({ post: item, label });
  };

  add(seriesPosts[currentIndex - 1], '上一篇');
  add(seriesPosts[currentIndex + 1], '下一篇');

  const rest = seriesPosts.filter((item) => item.id !== post.id && item.id !== excludedId && !recommendations.some((entry) => entry.post.id === item.id));
  if (rest.length && recommendations.length < RECOMMENDATION_LIMIT) {
    add(rest[seededIndex(`${post.id}-series-${state.recommendationHour}`, rest.length)], '同系列推薦');
  }

  return recommendations.slice(0, RECOMMENDATION_LIMIT);
}

function recommendationPool(post) {
  const seriesName = post.series || postSeriesNames(post)[0];
  const longEnough = (item) => (item.body || '').replace(/\s+/g, '').length >= RECOMMENDATION_MIN_BODY_LENGTH;
  if (seriesName) {
    const seriesPool = posts.filter((item) => item.id !== post.id && postHasSeries(item, seriesName) && longEnough(item));
    if (seriesPool.length) return seriesPool;
  }
  if (post.category) {
    const categoryPool = posts.filter((item) => item.id !== post.id && item.category === post.category && longEnough(item));
    if (categoryPool.length) return categoryPool;
  }
  return posts.filter((item) => item.id !== post.id && longEnough(item));
}

function seededIndex(seed, length) {
  if (!length) return 0;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % length;
}

function currentHourKey() {
  return Math.floor(Date.now() / 3600000);
}

function pillarScore(post, pillar) {
  const filter = PILLAR_FILTERS[pillar];
  if (!filter) return 0;

  let score = 0;
  if ((filter.categories || []).includes(post.category)) score += 2;
  if ((filter.series || []).some((seriesName) => postHasSeries(post, seriesName))) score += 5;

  const title = normalizeSearch(post.title || '');
  const body = normalizeSearch(post.body || '');
  const tags = normalizeSearch((post.tags || []).join('\n'));

  for (const keyword of filter.keywords || []) {
    const token = normalizeSearch(keyword);
    if (!token) continue;
    if (title.includes(token)) score += 3;
    else if (tags.includes(token)) score += 2;
    else if (body.includes(token)) score += 1;
  }

  return score >= (filter.minScore || 1) ? score : 0;
}

function selectPillar(button) {
  const pillar = button.dataset.pillar || '';
  state.pillar = pillar;
  state.query = '';
  state.category = '全部';
  state.year = '全部年份';
  state.series = '全部系列';
  state.visible = PAGE_SIZE;
  state.selectedId = null;
  searchInput.value = '';
  render();
  const resultCount = matchPosts().length;
  const filter = PILLAR_FILTERS[pillar] || {};
  trackEvent('pillar_section_click', {
    pillar_name: pillar,
    category_name: (filter.categories || []).join('、'),
    series_name: (filter.series || []).join('、'),
    result_count: resultCount
  });
  if (scrollToResultsOnMobile()) return;
  document.querySelector('.layout')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function selectSeries(series, source = 'series_tab') {
  state.series = state.series === series ? '全部系列' : series;
  state.category = '全部';
  state.pillar = '';
  state.sort = state.series === '全部系列' ? DEFAULT_SORT : SERIES_SORT;
  state.visible = PAGE_SIZE;
  state.selectedId = null;
  render();
  trackEvent('filter_series', {
    series_name: state.series,
    source,
    result_count: matchPosts().length
  });
  scrollToResultsOnMobile();
}

function scrollToResultsOnMobile() {
  if (!window.matchMedia('(max-width: 860px)').matches) return false;
  document.querySelector('.results')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  return true;
}

function selectedPost(filtered) {
  if (!filtered.length) return null;
  if (!state.selectedId) return null;
  return filtered.find((post) => post.id === state.selectedId) || null;
}

function countBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return new Map([...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant')));
}

function countSeries(items) {
  const map = new Map();
  for (const item of items) {
    for (const seriesName of postSeriesNames(item)) {
      map.set(seriesName, (map.get(seriesName) || 0) + 1);
    }
  }
  return new Map([...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant')));
}

function statLine(label, value) {
  const row = document.createElement('div');
  row.className = 'stat';
  const term = document.createElement('span');
  term.textContent = label;
  const data = document.createElement('strong');
  data.textContent = value;
  row.append(term, data);
  return row;
}

function detailItem(label, value) {
  const fragment = document.createDocumentFragment();
  const term = document.createElement('dt');
  term.textContent = label;
  const description = document.createElement('dd');
  description.textContent = value || '-';
  fragment.append(term, description);
  return fragment;
}

function appendSeriesBadges(container, post, clickable = false) {
  const badges = postSeriesNames(post).map((seriesName) => seriesBadge(post, clickable, seriesName));
  container.append(...badges);
}

function seriesBadge(post, clickable = false, seriesName = post.series) {
  const badge = document.createElement(clickable ? 'button' : 'span');
  badge.className = 'series-badge';
  if (clickable) {
    badge.type = 'button';
    badge.title = `查看 ${seriesName}`;
    badge.addEventListener('click', (event) => {
      event.stopPropagation();
      selectSeries(seriesName);
    });
    badge.addEventListener('keydown', (event) => {
      event.stopPropagation();
    });
  }
  badge.textContent = seriesLabel(post, seriesName);
  return badge;
}

function seriesLabel(post, seriesName = post.series) {
  if (!seriesName) return '';
  if (seriesName !== post.series) return seriesName;
  const index = post.seriesIndex ? ` ${post.seriesIndex}` : '';
  const unit = post.seriesUnit || '';
  return `${seriesName}${index}${unit}`;
}

function postSeriesNames(post) {
  return [...new Set([post.series, ...(post.seriesAliases || [])].filter(Boolean))];
}

function postHasSeries(post, seriesName) {
  return postSeriesNames(post).includes(seriesName);
}

function paragraphBlocks(text) {
  return (text || '').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}

function excerpt(text) {
  const compact = (text || '').replace(/\s+/g, ' ').trim();
  return compact.length > 120 ? `${compact.slice(0, 120)}...` : compact;
}

function publicPreview(text) {
  const body = (text || '').toString().trim();
  if (!body || body.length <= 180) return body;
  const limit = Math.max(1, Math.ceil(body.length * PUBLIC_PREVIEW_RATIO));
  const slice = body.slice(0, limit);
  const cleanCut = slice.replace(/[，,。！？!?；;：:、\s]*[^\n，,。！？!?；;：:、\s]{0,18}$/, '');
  return `${(cleanCut || slice).trim()}...`;
}

function publicExcerpt(text) {
  const compact = publicPreview(text).replace(/\s+/g, ' ').trim();
  return compact.length > 180 ? `${compact.slice(0, 180)}...` : compact;
}

function searchTokens(query) {
  return normalizeSearch(query).split(/\s+/).filter(Boolean);
}

function normalizeSearch(text) {
  return (text || '').toString().toLowerCase().normalize('NFKC');
}

function normalizeSecret(text) {
  return (text || '').toString().trim().normalize('NFKC');
}

function readUnlockState() {
  try {
    return window.sessionStorage.getItem(ARTICLE_UNLOCK_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeUnlockState() {
  try {
    window.sessionStorage.setItem(ARTICLE_UNLOCK_KEY, 'true');
  } catch {
    // Session storage can be unavailable in strict browser modes; keep the in-memory unlock.
  }
}

function option(value) {
  const node = document.createElement('option');
  node.value = value;
  node.textContent = value;
  return node;
}

function formatCount(value) {
  return countFormat.format(Number(value) || 0);
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to a temporary textarea below.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.left = '-1000px';
  document.body.append(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
