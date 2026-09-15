import { LanguageCode } from '../types';

export interface StoryTranslation {
  languageName: string;
  nativeName: string;
  locale: string;
  transcript: string;
  phoneticTranscript: string;
  englishPhonetic: string;
  durationEstimateSec: number;
}

export interface ArtisanVoiceStory {
  artisanId: string;
  artisanName: string;
  defaultLang: LanguageCode;
  stories: Record<LanguageCode, StoryTranslation>;
}

export const artisanVoiceStories: Record<string, ArtisanVoiceStory> = {
  // Sita Devi Mahapatra - Pipli Appliqué
  "artisan-01": {
    artisanId: "artisan-01",
    artisanName: "Sita Devi Mahapatra",
    defaultLang: "or",
    stories: {
      or: {
        languageName: "Odia",
        nativeName: "ଓଡ଼ିଆ",
        locale: "or-IN",
        transcript: "ନମସ୍କାର, ମୁଁ ସୀତା ଦେବୀ ମହାପାତ୍ର। ପିପିଲିର ୪ର୍ଥ ପିଢ଼ିର ଚାନ୍ଦୁଆ କାରିଗର। ହାତକଟା ଖଦି କପଡ଼ା, ପ୍ରାକୃତିକ ରଙ୍ଗ ଏବଂ ସୁନ୍ଦର କାଚ କାମ ସହ ମୁଁ ମନ୍ଦିର ଚାନ୍ଦୁଆ ଓ ହାତକାମ ସଜାବଟ ତିଆରି କରେ।",
        phoneticTranscript: "नमस्कार, मुँ सीता देवी महापात्र। पिपिलिर चौथी पीढ़ीर चांदुआ कारिगर। हाथकटा खादी कपड़ा, प्राकृतिक रंग एवं सुंदर कांच काम सह मुँ मंदिर चांदुआ ओ हाथकाम सजावट तैयार करे।",
        englishPhonetic: "Namaskar, mun Sita Devi Mahapatra. Piplira 4th pidhira Chandua karigara. Hatakata Khadi kapada, prakrutika ranga evam sundara kacha kama saha mun mandira Chandua o hatakama sajabata tiari kare.",
        durationEstimateSec: 22
      },
      hi: {
        languageName: "Hindi",
        nativeName: "हिन्दी",
        locale: "hi-IN",
        transcript: "नमस्ते, मैं सीता देवी महापात्र हूँ। पूरी, ओडिशा के पिपली की चौथी पीढ़ी की चंदुआ कारीगर। हाथ से बुने खादी कपड़े, प्राकृतिक रंगों और शीशा कढ़ाई से मैं पवित्र मंदिर चंदुआ तैयार करती हूँ।",
        phoneticTranscript: "नमस्ते, मैं सीता देवी महापात्र हूँ। पूरी, ओडिशा के पिपली की चौथी पीढ़ी की चंदुआ कारीगर। हाथ से बुने खादी कपड़े, प्राकृतिक रंगों और शीशा कढ़ाई से मैं पवित्र मंदिर चंदुआ तैयार करती हूँ।",
        englishPhonetic: "Namaste, main Sita Devi Mahapatra hoon. Puri, Odisha ke Pipli ki chauthi peedhi ki Chandua karigar. Haath se bune Khadi kapde, prakritik rangon aur shisha kadhai se main pabitra mandir Chandua tayar karti hoon.",
        durationEstimateSec: 22
      },
      en: {
        languageName: "English",
        nativeName: "English",
        locale: "en-IN",
        transcript: "Greetings, I am Sita Devi Mahapatra, a 4th generation heirloom artisan of Pipli Chandua craft from Puri, Odisha. I specialize in sacred temple canopies, organic cotton patchwork, and natural mirror embroidery.",
        phoneticTranscript: "Greetings, I am Sita Devi Mahapatra, a 4th generation heirloom artisan of Pipli Chandua craft from Puri, Odisha. I specialize in sacred temple canopies, organic cotton patchwork, and natural mirror embroidery.",
        englishPhonetic: "Greetings, I am Sita Devi Mahapatra, a 4th generation heirloom artisan of Pipli Chandua craft from Puri, Odisha. I specialize in sacred temple canopies, organic cotton patchwork, and natural mirror embroidery.",
        durationEstimateSec: 20
      },
      bn: {
        languageName: "Bengali",
        nativeName: "বাংলা",
        locale: "bn-IN",
        transcript: "নমস্কার, আমি সীতা দেবী মহাপাত্র। ওড়িশার পিপলির চতুর্থ প্রজন্মের ঐতিহ্যবাহী চান্দুয়া শিল্পী। খাঁটি তুলা, প্রাকৃতিক রং এবং ঐতিহ্যবাহী আয়নার কারুকাজে আমি মন্দিরের চাঁদোয়া তৈরি করি।",
        phoneticTranscript: "नमस्कार, आमी सीता देवी महापात्र। ओडिशा-र पिपली-र चतुर्थ प्रजन्म-ेर ओइतिह्यबाही चांदुआ शिल्पी। खांटि तुला, प्राकृतिक रंग एवं ओइतिह्यबाही आयनार कारुकाजे आमी मंदिरेर चांदोया तोइरी करि।",
        englishPhonetic: "Namaskar, ami Sita Devi Mahapatra. Odishar Piplir chaturtha prajanmer aitihyabahi Chandua shilpi. Khati tula, prakritik rang evam aitihyabahi aynar karukaje ami mandirer chandoya tairi kori.",
        durationEstimateSec: 22
      },
      ta: {
        languageName: "Tamil",
        nativeName: "தமிழ்",
        locale: "ta-IN",
        transcript: "வணக்கம், நான் சீதா தேவி மஹாபாத்ரா. ஒடிசாவின் பிப்லி சந்துவா கைவினைப் பாரம்பரியத்தின் 4வது தலைமுறை கலைஞர். இயற்கை பருத்தி மற்றும் கண்ணாடி தையல் வேலைப்பாடுகளுடன் கோயில் விதானங்களை உருவாக்குகிறேன்.",
        phoneticTranscript: "वणक्कम, नान सीता देवी महापात्रा। ओडिशा-विन पिपली चंदुवा कैविनै पारंपरियत्तिन नानकावदु तलैमुऱै कलैञर। इयऱ्कै परुत्ति मऱ्ऱुम कण्णाडि तैयल वेलैप्पाडुगळुडन कोइल विदानंगळै उरुवाक्कुगिऱेन।",
        englishPhonetic: "Vanakkam, naan Sita Devi Mahapatra. Odishavin Pipli Chandua kaivinai parambariyathin 4th thalaimurai kalainjar. Iyarkai paruthi matrum kannadi thaiyal velaippadugaludan koyil vidanangalai uruvaakkugiren.",
        durationEstimateSec: 23
      },
      te: {
        languageName: "Telugu",
        nativeName: "తెలుగు",
        locale: "te-IN",
        transcript: "నమస్కారం, నేను సీతా దేవి మహాపాత్ర. పిప్లి చందూవా చేతివృత్తిలో 4వ తరం కళాకారిణిని. సహజమైన పత్తి, వస్త్రాలు మరియు సాంప్రదాయ అద్దాల అల్లికలతో పవిత్ర దేవాలయ ఆలయ తోరణాలను తయారు చేస్తాను.",
        phoneticTranscript: "नमस्कारम, नेनु सीता देवी महापात्र। पिपलि चंदूवा चेतिवृत्तिलो नालुगुव तरम कलाकारिणिनी। सहजमैन पत्ति, वस्त्रालु मरियु सांपरादायिक अद्दाल अल्लिकतो पवित्र देवालय तोरणालनु तयारू चेस्तानु।",
        englishPhonetic: "Namaskaram, nenu Sita Devi Mahapatra. Pipli Chandua chetivrittilo 4th tharam kalakarinini. Sahajamaina patti, vastralu mariyu sampradaya addala allikato pabitra devalaya toranalanu tayaru chestanu.",
        durationEstimateSec: 23
      },
      kn: {
        languageName: "Kannada",
        nativeName: "ಕನ್ನಡ",
        locale: "kn-IN",
        transcript: "ನಮಸ್ಕಾರ, ನಾನು ಸೀತಾ ದೇವಿ ಮಹಾಪಾತ್ರ. ಒಡಿಶಾದ ಪಿಪ್ಲಿ ಚಂದೂವಾ ಕಲೆಯ 4ನೇ ತಲೆಮಾರಿನ ಕುಶಲಕರ್ಮಿ. ನೈಸರ್ಗಿಕ ಹತ್ತಿ, ನೈಸರ್ಗಿಕ ಬಣ್ಣಗಳು ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಕನ್ನಡಿ ಕಸೂತಿಯಿಂದ ದೇವಾಲಯದ ಛಾವಣಿಗಳನ್ನು ತಯಾರಿಸುತ್ತೇನೆ.",
        phoneticTranscript: "नमस्कार, नानू सीता देवी महापात्र। ओडिशाद पिपली चंदूवा कलेय नाल्कने तलेमारिन कुशलकर्मी। नैसर्गिक हत्ती, नैसर्गिक बण्णगळु मत्तु सांग्रदायिक कन्नडी कसूदियिंद देवालयद छावणीगळन्नु तयारिस्तेने।",
        englishPhonetic: "Namaskara, nanu Sita Devi Mahapatra. Odishada Pipli Chandua kaleya 4th thalmarina kushalkarmi. Naisargika hatti, naisargika bannagalu mattu sampradayika kannadi kasudiyinda devalayada chavanigalannu tayaristene.",
        durationEstimateSec: 23
      },
      mr: {
        languageName: "Marathi",
        nativeName: "मराठी",
        locale: "mr-IN",
        transcript: "नमस्कार, मी सीता देवी महापात्रा. पिपली चांदुआ हस्तकलेची चौथी पिढीतील कारागीर. नैसर्गिक सुती कापड, नैसर्गिक रंग आणि पारंपारिक काच भरतकामाने मी मंदिरातील छत आणि कलाकृती तयार करते.",
        phoneticTranscript: "नमस्कार, मी सीता देवी महापात्रा. पिपली चांदुआ हस्तकलेची चौथी पिढीतील कारागीर. नैसर्गिक सुती कापड, नैसर्गिक रंग आणि पारंपारिक काच भरतकामाने मी मंदिरातील छत आणि कलाकृती तयार करते.",
        englishPhonetic: "Namaskar, mi Sita Devi Mahapatra. Pipli Chandua hastakalechi chauthi pidhitil karagir. Naisargik suti kapad, naisargik rang ani paramparik kach bharatkamaney mi mandiratil chhat ani kalakruti tayar karte.",
        durationEstimateSec: 22
      },
      gu: {
        languageName: "Gujarati",
        nativeName: "ગુજરાતી",
        locale: "gu-IN",
        transcript: "નમસ્તે, હું સીતા દેવી મહાપાત્રા છું. પિપલી ચાંદુઆ હસ્તકળાની ચોથી પેઢીની કારીગર. કુદરતી કપાસ, કુદરતી રંગો અને પરંપરાગત અરીસાના ભરતકામ વડે હું પવિત્ર મંદિરના છત્ર અને હસ્તકળા બનાવું છું.",
        phoneticTranscript: "नमस्ते, हूँ सीता देवी महापात्रा छुँ। पिपली चांदुआ हस्तकलानी चोथी पेढीनी कारीगर। कुदरती कपास, कुदरती रंगो अने परंपरागत अरीसाना भरतकाम वडे हूँ पवित्र मंदिरना छत्र अने हस्तकला बनावुं छुँ।",
        englishPhonetic: "Namaste, hun Sita Devi Mahapatra chhun. Pipli Chandua hastakalani chauthi pedhini karigar. Kudarati kapas, kudarati rango ane paramparagat arisana bharatkam vade hun pabitra mandirna chhatra ane hastakala banavu chhun.",
        durationEstimateSec: 22
      }
    }
  },

  // Ramesh Kumar Sahu - Dhokra Metallurgist
  "artisan-02": {
    artisanId: "artisan-02",
    artisanName: "Ramesh Kumar Sahu",
    defaultLang: "or",
    stories: {
      or: {
        languageName: "Odia",
        nativeName: "ଓଡ଼ିଆ",
        locale: "or-IN",
        transcript: "ମୁଁ ରମେଶ କୁମାର ସାହୁ। ୪୦୦୦ ବର୍ଷ ପୁରୁଣା ଢୋକ୍ରା ଧାତୁ ମୂର୍ତ୍ତି କଳା। ମହୁଫେଣା ମୋମ ଏବଂ ନଦୀ କାଦୁଅ ସାହାଯ୍ୟରେ ହାତତିଆରି ପିତ୍ତଳ କଳାକୃତି ଗଢ଼ିଥାଏ।",
        phoneticTranscript: "मुँ रमेश कुमार साहू। ४००० बर्ष पुरुणा ढोकरा धातु मूर्ति कला। महुफेणा मोम एवं नदी कादुआ साहारा रे हाथतिआरी पित्तळ कलाकृति गढ़िथाए।",
        englishPhonetic: "Mun Ramesh Kumar Sahu. 4000 barsha puruna Dhokra dhatu murti kala. Mahuphena moma evam nadi kadua sahayata re hatatiari pittala kalakruti gadhithae.",
        durationEstimateSec: 22
      },
      hi: {
        languageName: "Hindi",
        nativeName: "हिन्दी",
        locale: "hi-IN",
        transcript: "मैं रमेश कुमार साहू हूँ। 4,000 साल पुरानी ढोकरा धातु ढलाई कला का राष्ट्रीय पुरस्कार विजेता कारीगर। मोम की डोरियों और मिट्टी के साँचे से मैं पीतल की आकृतियाँ गढ़ता हूँ।",
        phoneticTranscript: "मैं रमेश कुमार साहू हूँ। 4,000 साल पुरानी ढोकरा धातु ढलाई कला का राष्ट्रीय पुरस्कार विजेता कारीगर। मोम की डोरियों और मिट्टी के साँचे से मैं पीतल की आकृतियाँ गढ़ता हूँ।",
        englishPhonetic: "Main Ramesh Kumar Sahu hoon. 4,000 saal purani Dhokra dhatu dhalai kala ka rashtriya puraskar vijeta karigar. Mom ki doriyon aur mitti ke sanche se main pital ki aakritiyan gadhta hoon.",
        durationEstimateSec: 22
      },
      en: {
        languageName: "English",
        nativeName: "English",
        locale: "en-IN",
        transcript: "I am Ramesh Kumar Sahu, a National Awardee Dhokra metallurgist. I practice the 4,000-year-old lost-wax casting technique using beeswax cords and clay molds to create brass sculptures.",
        phoneticTranscript: "I am Ramesh Kumar Sahu, a National Awardee Dhokra metallurgist. I practice the 4,000-year-old lost-wax casting technique using beeswax cords and clay molds to create brass sculptures.",
        englishPhonetic: "I am Ramesh Kumar Sahu, a National Awardee Dhokra metallurgist. I practice the 4,000-year-old lost-wax casting technique using beeswax cords and clay molds to create brass sculptures.",
        durationEstimateSec: 20
      },
      bn: {
        languageName: "Bengali",
        nativeName: "বাংলা",
        locale: "bn-IN",
        transcript: "আমি রমেশ কুমার সাহু। চার হাজার বছরের প্রাচীন ঢোকরা ধাতু শিল্পে জাতীয় পুরস্কারপ্রাপ্ত কারিগর। মোম এবং নদীর কাদা দিয়ে পিতলের লোকশিল্প রূপায়ণ করি।",
        phoneticTranscript: "आमी रमेश कुमार साहू। चार हाजार बछरेर प्राचीन ढोकरा धातु शिल्पे जातीय पुरस्कारप्राप्त कारिगर। मोम एवं नदीर कादा दिये पितलेर लोकशिल्प रूपाण करि।",
        englishPhonetic: "Ami Ramesh Kumar Sahu. Char hajar bachherer prachin Dhokra dhatu shilpe jatiya puraskarpratapta karigar. Mom evam nadir kada diye pitler lokashilpa rupayan kori.",
        durationEstimateSec: 22
      },
      ta: {
        languageName: "Tamil",
        nativeName: "தமிழ்",
        locale: "ta-IN",
        transcript: "நான் ரமேஷ் குமார் சாஹு. 4,000 ஆண்டுகள் பழமையான தோக்ரா உலோகக் கலையில் தேசிய விருது பெற்ற கைவினைஞர். தேன்மெழுகு மற்றும் களிமண் அச்சுக்களைப் பயன்படுத்தி பித்தளை சிற்பங்களை உருவாக்குகிறேன்.",
        phoneticTranscript: "नान रमेष कुमार साहु। 4,000 आंडुकळ पळमैयान तोग्रा उलोगक कलैयिल देषिय विरुदु पेऱ्ऱ कैविनैञर। तेन्मेळुगु मऱ्ऱुम कळिमण् अच्चुक्कळै पयनपडुत्ति पित्तळै चिऱ्पंगळै उरुवाक्कुगिऱेन।",
        englishPhonetic: "Naan Ramesh Kumar Sahu. 4,000 aandugal pazhamaiyana Dhokra ulogak kalaiyil desiya virudu petra kaivinaijnar. Thenmezhugu matrum kalimann achukkalai payanpaduthi pithalai sirpangalai uruvaakkugiren.",
        durationEstimateSec: 23
      },
      te: {
        languageName: "Telugu",
        nativeName: "తెలుగు",
        locale: "te-IN",
        transcript: "నేను రమేష్ కుమార్ సాహు. 4,000 ఏళ్ల పురాతన ధోక్రా లోహ శిల్పకళలో జాతీయ అవార్డు గ్రహీతను. తేనెటీగల మైనపు దారాలు మరియు మట్టి అచ్చులతో ఇత్తడి విగ్రహాలను తీర్చిదిద్దుతాను.",
        phoneticTranscript: "नेनु रमेश कुमार साहु। 4,000 एळ्ळ पुरातन धोक्रा लोह शिल्पकळलो जातीय अवार्डु ग्रहीतनु। तेनेटीगल मैनपु दारालु मरियु मट्टि अच्चुलतो इत्तडि विग्रहालनु तीर्चिदिद्दुतानु।",
        englishPhonetic: "Nenu Ramesh Kumar Sahu. 4,000 ella puratana Dhokra loha shilpakalalo jatiya awardu grahitanu. Tenetigala mainapu daralu mariyu matti achulato ittadi vigrahalanu tirchididdutanu.",
        durationEstimateSec: 23
      },
      kn: {
        languageName: "Kannada",
        nativeName: "ಕನ್ನಡ",
        locale: "kn-IN",
        transcript: "ನಾನು ರಮೇಶ್ ಕುಮಾರ್ ಸಾಹು. 4,000 ವರ್ಷಗಳ ಪುರಾತನ ಢೋಕ್ರಾ ಲೋಹದ ಕಲೆಯ ರಾಷ್ಟ್ರೀಯ ಪ್ರಶಸ್ತಿ ವಿಜೇತ ಕುಶಲಕರ್ಮಿ. ಮೇಣದ ದಾರಗಳು ಮತ್ತು ಜೇಡಿಮಣ್ಣಿನ ಅಚ್ಚುಗಳಿಂದ ಹಿತ್ತಾಳೆಯ ಕಲಾಕೃತಿಗಳನ್ನು ರಚಿಸುತ್ತೇನೆ.",
        phoneticTranscript: "नानू रमेश कुमार साहु। 4,000 वर्षगळ पुरातन ढ़ोक्रा लोहद कलेय राष्ट्रीय प्रशस्ति विजेत कुशलकर्मी। मेणद दारगळु मत्तु जेडीमण्णिन अच्छुगळिंद हित्ताळेय कलाकृतिगळन्नु रचिस्तेने।",
        englishPhonetic: "Nanu Ramesh Kumar Sahu. 4,000 varshagala puratana Dhokra lohada kaleya rashtriya prashasti vijeta kushalkarmi. Menada daragalu mattu jedimannina achugalinda hittaleya kalakrutigalannu rachistene.",
        durationEstimateSec: 23
      },
      mr: {
        languageName: "Marathi",
        nativeName: "मराठी",
        locale: "mr-IN",
        transcript: "मी रमेश कुमार साहू. ४,००० वर्षे जुन्या ढोकरा धातू कलेतील राष्ट्रीय पुरस्कार विजेते कारागीर. मेण आणि मातीच्या साच्यांच्या साहाय्याने मी पितळेच्या मूर्ती तयार करतो.",
        phoneticTranscript: "मी रमेश कुमार साहू. ४,००० वर्षे जुन्या ढोकरा धातू कलेतील राष्ट्रीय पुरस्कार विजेते कारागीर. मेण आणि मातीच्या साच्यांच्या साहाय्याने मी पितळेच्या मूर्ती तयार करतो.",
        englishPhonetic: "Mi Ramesh Kumar Sahu. 4,000 varshe junya Dhokra dhatu kaletil rashtriya puraskar vijete karagir. Men ani matiya sachanchya sahayyane mi pitalchya murti tayar karto.",
        durationEstimateSec: 22
      },
      gu: {
        languageName: "Gujarati",
        nativeName: "ગુજરાતી",
        locale: "gu-IN",
        transcript: "હું રમેશ કુમાર સાહૂ છું. 4,000 વર્ષ જૂની ઢોકરા ધાતુ કળાના રાષ્ટ્રીય પુરસ્કાર વિજેતા કારીગર. મધપૂડાના મીણ અને માટીના બીબાં વડે હું પિત્તળના શિલ્પો બનાવું છું.",
        phoneticTranscript: "હું રમેશ કુમાર સાહૂ છું. 4,000 વર્ષ જૂની ઢોકરા ધાતુ કળાના રાષ્ટ્રીય પુરસ્કાર વિજેતા કારીગર. મધપૂડાના મીણ અને માટીના બીબાં વડે હું પિત્તળના શિલ્પો બનાવું છું.",
        englishPhonetic: "Hun Ramesh Kumar Sahu chhun. 4,000 varsh meuni Dhokra dhatu kalana rashtriya puraskar vijeta karigar. Madhpudana min ane matina biban vade hun pittalna shilpo banavu chhun.",
        durationEstimateSec: 22
      }
    }
  },

  // Anita Das & Weavers Collective - Sambalpuri Bandha
  "artisan-03": {
    artisanId: "artisan-03",
    artisanName: "Anita Das & Weavers Collective",
    defaultLang: "or",
    stories: {
      or: {
        languageName: "Odia",
        nativeName: "ଓଡ଼ିଆ",
        locale: "or-IN",
        transcript: "ମୁଁ ଅନିତା ଦାସ, ବରଗଡ଼ର ମାଷ୍ଟର ସମ୍ବଲପୁରୀ ବୁଣାକାର। ଗାଣିତିକ ସୂତା ଗଣ୍ଠି ଏବଂ ବାନ୍ଧ ଶୈଳୀରେ ତସର ଓ ରେଶମ ଶାଢ଼ୀରେ ଓଡ଼ିଶାର ଐତିହ୍ୟକୁ ଜୀବନ୍ତ କରିଥାଉ।",
        phoneticTranscript: "मुँ अनिता दास, बरगढ़र मास्टर संबलपुरी बुणाकार। गणितिक सूता गंठि एवं बांध शैली रे तसर ओ रेशम शाढ़ी रे ओड़िशार ऐतिह्य को जीवंत करिथाउ।",
        englishPhonetic: "Mun Anita Das, Bargarhar master Sambalpuri bunakara. Ganitika suta ganthi evam Bandha shaili re tasar o resham sadhi re Odishar aitihya ko jibanta karithau.",
        durationEstimateSec: 22
      },
      hi: {
        languageName: "Hindi",
        nativeName: "हिन्दी",
        locale: "hi-IN",
        transcript: "मैं अनिता दास हूँ। सम्बलपुरी बांधा इकत बुनाई की मास्टर बुनकर। रेशम और सूती धागों के सटीक ताने-बाने से हम ओडिया लोककथाओं की बुनाई करते हैं।",
        phoneticTranscript: "मैं अनिता दास हूँ। सम्बलपुरी बांधा इकत बुनाई की मास्टर बुनकर। रेशम और सूती धागों के सटीक ताने-बाने से हम ओडिया लोककथाओं की बुनाई करते हैं।",
        englishPhonetic: "Main Anita Das hoon. Sambalpuri Bandha ikat bunai ki master bunkar. Resham aur suti dhagon ke sateek tane-bane se hum Odia lok-kathaon ki bunai karte hain.",
        durationEstimateSec: 22
      },
      en: {
        languageName: "English",
        nativeName: "English",
        locale: "en-IN",
        transcript: "I am Anita Das, master handloom Bandha weaver from Bargarh. I specialize in the mathematical tie-dye warp-weft precision of Sambalpuri double ikat sarees.",
        phoneticTranscript: "I am Anita Das, master handloom Bandha weaver from Bargarh. I specialize in the mathematical tie-dye warp-weft precision of Sambalpuri double ikat sarees.",
        englishPhonetic: "I am Anita Das, master handloom Bandha weaver from Bargarh. I specialize in the mathematical tie-dye warp-weft precision of Sambalpuri double ikat sarees.",
        durationEstimateSec: 20
      },
      bn: {
        languageName: "Bengali",
        nativeName: "বাংলা",
        locale: "bn-IN",
        transcript: "আমি অনিতা দাস। সম্বলপুরী বান্ধা শাড়ির মাস্টার তাঁতি। সিল্ক এবং সুতির সুতোয় ওড়িশার লোকগাথা ও ঐতিহ্য ফুটিয়ে তুলি।",
        phoneticTranscript: "आमी अनिता दास। संबलपुरी बांधा शाड़ीर मास्टर तांती। सिल्क एवं सुतीर सुतोय ओडिशा-र लोकगाथा ओ ओइतिह्य फुटिये तुलि।",
        englishPhonetic: "Ami Anita Das. Sambalpuri Bandha sadir master tanti. Silk evam sutir sutoy Odishar lokagatha o aitihya futiye tuli.",
        durationEstimateSec: 22
      },
      ta: {
        languageName: "Tamil",
        nativeName: "தமிழ்",
        locale: "ta-IN",
        transcript: "நான் அனிதா தாஸ். சம்பல்பூரி பாந்தா இக்கத் நெசவு கலைஞர். பட்டு மற்றும் பருத்தி நூல்களில் பாரம்பரிய கதைகளை நெய்கிறேன்.",
        phoneticTranscript: "नान अनिता दास। संपल्पूरि पांदा इक्कत नेसवु कलैञर। पट्टु मऱ्ऱुम परुत्ति नूलगळिल पारंपरिय कदैगळै नेयगिऱेन।",
        englishPhonetic: "Naan Anita Das. Sambalpuri Bandha ikat nesavu kalainjar. Pattu matrum paruthi noolgalil parambariya kadhaigalai neyiren.",
        durationEstimateSec: 23
      },
      te: {
        languageName: "Telugu",
        nativeName: "తెలుగు",
        locale: "te-IN",
        transcript: "నేను అనితా దాస్. సంబల్‌పురి బాంధా ఇకత్ చేనేత కళాకారిణిని. పట్టు దారాలతో సాంప్రదాయ డిజైన్లను నేస్తాను.",
        phoneticTranscript: "नेनु अनिता दास। संबलपुरि बांधा इकत चेनेत कलाकारिणिनी। पट्टु दारालतो सांपरादायिक डिजैन लनु नेस्तानु।",
        englishPhonetic: "Nenu Anita Das. Sambalpuri Bandha ikat chepeta kalakarini. Pattu daralato sampradaya designlanu nestanu.",
        durationEstimateSec: 23
      },
      kn: {
        languageName: "Kannada",
        nativeName: "ಕನ್ನಡ",
        locale: "kn-IN",
        transcript: "ನಾನು ಅನಿತಾ ದಾಸ್. ಸಂಪೂರ್ಣ ಕೈಮಗ್ಗದ ಸಂಬಲ್ಪುರಿ ಬಂಧಾ ಇಕತ್ ನೇಕಾರಳು. ರೇಷ್ಮೆ ದಾರಗಳಿಂದ ನೈಸರ್ಗಿಕ ಕಲಾಕೃತಿಗಳನ್ನು ನೇಯುತ್ತೇನೆ.",
        phoneticTranscript: "नानू अनिता दास। संपूर्ण कैमग्गद संबलपुरि बांधा इकत नेकारळु। रेष्मे दारगळिंद नैसर्गिक कलाकृतिगळन्नु नेयुत्तेने।",
        englishPhonetic: "Nanu Anita Das. Sampurna kaimaggada Sambalpuri Bandha ikat nekaralu. Reshme daragalinda naisargika kalakrutigalannu neyuttene.",
        durationEstimateSec: 23
      },
      mr: {
        languageName: "Marathi",
        nativeName: "मराठी",
        locale: "mr-IN",
        transcript: "मी अनिता दास. संबलपुरी बांधा इकत विणकामाची मास्टर विणकर. रेशमी धाग्यांनी आम्ही पारंपरिक लोककथा विणतो.",
        phoneticTranscript: "मी अनिता दास. संबलपुरी बांधा इकत विणकामाची मास्टर विणकर. रेशमी धाग्यांनी आम्ही पारंपरिक लोककथा विणतो.",
        englishPhonetic: "Mi Anita Das. Sambalpuri Bandha ikat vinkamachi master vinkar. Reshmi dhagyani amhi paramparik lokakatha vinto.",
        durationEstimateSec: 22
      },
      gu: {
        languageName: "Gujarati",
        nativeName: "ગુજરાતી",
        locale: "gu-IN",
        transcript: "હું અનિતા દાસ છું. સંબલપુરી બાંધા ઇકત વણાટકામના માસ્ટર વણકર. રેશમના તાંતણા વડે ઓડિયા લોકવાર્તાઓને વણીએ છીએ.",
        phoneticTranscript: "હું અનિતા દાસ છું. સંબલપુરી બાંધા ઇકત વણાટકામના માસ્ટર વણકર. રેશમના તાંતણા વડે ઓડિયા લોકવાર્તાઓને વણીએ છીએ.",
        englishPhonetic: "Hun Anita Das chhun. Sambalpuri Bandha ikat vanatkamna master vanakar. Reshamna tantana vade Odia lokavartaone vanie chhie.",
        durationEstimateSec: 22
      }
    }
  },

  // Manjunath Gowda - Channapatna Wooden Toys
  "artisan-04": {
    artisanId: "artisan-04",
    artisanName: "Manjunath Gowda",
    defaultLang: "kn",
    stories: {
      kn: {
        languageName: "Kannada",
        nativeName: "ಕನ್ನಡ",
        locale: "kn-IN",
        transcript: "ನಮಸ್ಕಾರ, ನಾನು ಮಂಜುನಾಥ್ ಗೌಡ. ಚನ್ನಪಟ್ಟಣದ ಮರದ ಆಟಿಕೆಗಳ ಮಾಸ್ಟರ್ ಕುಶಲಕರ್ಮಿ. ಆಲೆ ಮರ, ಅರಿಶಿನ, ನೀಲಿ ಮತ್ತು ಕಂಕುಮದ ನೈಸರ್ಗಿಕ ಬಣ್ಣಗಳಿಂದ ಮಕ್ಕಳಿಗೆ ಸುರಕ್ಷಿತ ಆಟಿಕೆಗಳನ್ನು ತಯಾರಿಸುತ್ತೇನೆ.",
        phoneticTranscript: "नमस्कार, नानू मंजुनाथ गौडा। चन्नपट्टणद मरद आटिकेगळ मास्टर कुशलकर्मी। आले मर, अरिशिन, नीलि मत्तु कुंकुमद नैसर्गिक बण्णगळिंद मक्कळिगे सुरक्षित आटिकेगळन्नु तयारिस्तेने।",
        englishPhonetic: "Namaskara, nanu Manjunath Gowda. Channapatnada marada atikegala master kushalkarmi. Aale mara, arishina, neeli mattu kunkumada naisargika bannagalinda makkalige surakshita atikegalannu tayaristene.",
        durationEstimateSec: 23
      },
      hi: {
        languageName: "Hindi",
        nativeName: "हिन्दी",
        locale: "hi-IN",
        transcript: "मैं मंजूनाथ गौड़ा हूँ। चन्नापटना लकड़ी के खिलौने का कारीगर। हल्दी, नील और कुमकुम के प्राकृतिक रंगों से बच्चों के लिए पर्यावरण-अनुकूल खिलौने बनाता हूँ।",
        phoneticTranscript: "मैं मंजूनाथ गौड़ा हूँ। चन्नापटना लकड़ी के खिलौने का कारीगर। हल्दी, नील और कुमकुम के प्राकृतिक रंगों से बच्चों के लिए पर्यावरण-अनुकूल खिलौने बनाता हूँ।",
        englishPhonetic: "Main Manjunath Gowda hoon. Channapatna lakdi ke khilone ka karigar. Haldi, neel aur kumkum ke prakritik rangon se bachon ke liye paryavaran-anukool khilone banata hoon.",
        durationEstimateSec: 22
      },
      en: {
        languageName: "English",
        nativeName: "English",
        locale: "en-IN",
        transcript: "I am Manjunath Gowda from Channapatna, Karnataka. I craft non-toxic ivory-wood toys dyed with natural turmeric, indigo, and kumkum.",
        phoneticTranscript: "I am Manjunath Gowda from Channapatna, Karnataka. I craft non-toxic ivory-wood toys dyed with natural turmeric, indigo, and kumkum.",
        englishPhonetic: "I am Manjunath Gowda from Channapatna, Karnataka. I craft non-toxic ivory-wood toys dyed with natural turmeric, indigo, and kumkum.",
        durationEstimateSec: 20
      },
      or: {
        languageName: "Odia",
        nativeName: "ଓଡ଼ିଆ",
        locale: "or-IN",
        transcript: "ମୁଁ ମଞ୍ଜୁନାଥ ଗୌଡ଼ା। ଚନ୍ନପାଟଣା କାଠ ଖେଳନା କାରିଗର। ହଳଦୀ, ଇଣ୍ଡିଗୋ ଏବଂ କାଠ ସାହାଯ୍ୟରେ ଶିଶୁଙ୍କ ପାଇଁ ନିରାପଦ ଖେଳନା ତିଆରି କରେ।",
        phoneticTranscript: "मुँ मंजुनाथ गौड़ा। चन्नपाटणा काठ खेळना कारिगर। हळदी, इण्डिगो एवं काठ साहाय्य रे शिशुंक पाईं निरापद खेळना तिआरी करे।",
        englishPhonetic: "Mun Manjunath Gowda. Channapatna katha khelana karigara. Haladi, indigo evam katha sahayata re shishunka pain nirapada khelana tiari kare.",
        durationEstimateSec: 23
      },
      bn: {
        languageName: "Bengali",
        nativeName: "বাংলা",
        locale: "bn-IN",
        transcript: "আমি মঞ্জুনাথ গৌড়া। চন্নাপাটনার কাঠের খেলনা কারিগর। হলুদ ও প্রাকৃতিক রঙের ছোঁয়ায় শিশুদের জন্য নিরাপদ খেলনা তৈরি করি।",
        phoneticTranscript: "आमी मंजुनाथ गौड़ा। चन्नापाटनार काठेर खेलना कारिगर। हलुद ओ प्राकृतिक रंगेर छोंवाय शिशुदेर जन्य सुरक्षित खेलना तोइरी करि।",
        englishPhonetic: "Ami Manjunath Gowda. Channapatnar kather khelna karigar. Halud o prakritik ranger chhovay shishuder janya surakshita khelna tairi kori.",
        durationEstimateSec: 22
      },
      ta: {
        languageName: "Tamil",
        nativeName: "தமிழ்",
        locale: "ta-IN",
        transcript: "நான் மஞ்சுநாத் கவுடா. சன்னப்பட்ணா மர பொம்மை கைவினைஞர். மஞ்சள் மற்றும் இயற்கை சாயங்களைப் பயன்படுத்தி குழந்தைகளுக்கு பாதுகாப்பான பொம்மைகளை செய்கிறேன்.",
        phoneticTranscript: "नान मंजुनाथ गौडा। सन्नप्पट्णा मर बोम्मै कैविनैञर। मञ्जळ मऱ्ऱुम इयऱ्कै सायंगळै पयनपडुत्ति कुळन्दैगळुक्कु पादुकाप्पाण बोम्मैगळै सैगिऱेन।",
        englishPhonetic: "Naan Manjunath Gowda. Channapatna mara bommai kaivinaijnar. Manjal matrum iyarkai saayangalai payanpaduthi kulandhaigalukku padukaappana bommaigalai seiyiren.",
        durationEstimateSec: 23
      },
      te: {
        languageName: "Telugu",
        nativeName: "తెలుగు",
        locale: "te-IN",
        transcript: "నేను మంజునాథ్ గౌడ. చన్నపట్నం చెక్క బొమ్మల కళాకారుడిని. పసుపు మరియు సహజ రంగులతో పిల్లల కోసం సురక్షితమైన బొమ్మలు తయారు చేస్తాను.",
        phoneticTranscript: "नेनु मंजुनाथ गौड। चन्नपटनम चेक्क बोम्मल कलाकारुडिनि। पसुपु मरियु सहज रंगुलतो पिल्लल कोसम सुरक्षितमैन बोम्मलु तयारू चेस्तानु।",
        englishPhonetic: "Nenu Manjunath Gowda. Channapatnam chekka bommala kalakarudini. Pasupu mariyu sahaja rangulato pillala kosam surakshitamaina bommalu tayaru chestanu.",
        durationEstimateSec: 23
      },
      mr: {
        languageName: "Marathi",
        nativeName: "मराठी",
        locale: "mr-IN",
        transcript: "मी मंजुनाथ गोवडा. चन्नापटना लाकडी खेळण्यांचे कारागीर. हळद आणि नैसर्गिक रंगांचा वापर करून मुलांसाठी सुरक्षित खेळणी बनवतो.",
        phoneticTranscript: "मी मंजुनाथ गोवडा. चन्नापटना लाकडी खेळण्यांचे कारागीर. हळद आणि नैसर्गिक रंगांचा वापर करून मुलांसाठी सुरक्षित खेळणी बनवतो.",
        englishPhonetic: "Mi Manjunath Gowda. Channapatna lakadi khelnyanche karagir. Halad ani naisargik rangancha vapar karun mulansathi surakshit khelni banavto.",
        durationEstimateSec: 22
      },
      gu: {
        languageName: "Gujarati",
        nativeName: "ગુજરાતી",
        locale: "gu-IN",
        transcript: "હું મંજુનાથ ગૌડા છું. ચન્નાપટના લાકડાના રમકડાંનો કારીગર. હળદર અને કુદરતી રંગો વડે બાળકો માટે સુરક્ષિત રમકડાં બનાવું છું.",
        phoneticTranscript: "હું મંજુનાથ ગૌડા છું. ચન્નાપટના લાકડાના રમકડાંનો કારીગર. હળદર અને કુદરતી રંગો વડે બાળકો માટે સુરક્ષિત રમકડાં બનાવું છું.",
        englishPhonetic: "Hun Manjunath Gowda chhun. Channapatna lakdana ramkadanno karigar. Haldar ane kudarati rango vade balko mate surakshit ramkada banavu chhun.",
        durationEstimateSec: 22
      }
    }
  }
};

/**
 * Fallback generator for dynamically created products or artisans not in static dictionary
 */
export function getArtisanStory(
  artisanId: string, 
  artisanName: string, 
  bio: string, 
  lang: LanguageCode
): StoryTranslation {
  const staticData = artisanVoiceStories[artisanId];
  if (staticData && staticData.stories[lang]) {
    return staticData.stories[lang];
  }

  // Generic fallback map for languages
  const langConfig: Record<LanguageCode, { languageName: string; nativeName: string; locale: string }> = {
    en: { languageName: 'English', nativeName: 'English', locale: 'en-IN' },
    hi: { languageName: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN' },
    or: { languageName: 'Odia', nativeName: 'ଓଡ଼ିଆ', locale: 'or-IN' },
    bn: { languageName: 'Bengali', nativeName: 'বাংলা', locale: 'bn-IN' },
    ta: { languageName: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN' },
    te: { languageName: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN' },
    kn: { languageName: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN' },
    mr: { languageName: 'Marathi', nativeName: 'मराठी', locale: 'mr-IN' },
    gu: { languageName: 'Gujarati', nativeName: 'ગુજરાતી', locale: 'gu-IN' },
  };

  const config = langConfig[lang] || langConfig.en;

  return {
    languageName: config.languageName,
    nativeName: config.nativeName,
    locale: config.locale,
    transcript: `${artisanName}: "${bio}"`,
    phoneticTranscript: `${artisanName}: "${bio}"`,
    englishPhonetic: `${artisanName}: "${bio}"`,
    durationEstimateSec: 20
  };
}
