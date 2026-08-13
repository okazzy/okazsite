'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import './qa.css';

interface QAItemProps {
  question: string;
  answer: string;
  isLast?: boolean;
  isArabic: boolean;
}

function QAItem({ question, answer, isLast, isArabic }: QAItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const router = useRouter();

  const handleCopyLink = () => {
    router.push('/contact');
  };

  const handleCopyEmail = () => {
    window.location.href = "mailto:support@okaz.io";
  };

  return (
    <div className={`qa-item ${isExpanded ? 'expanded' : ''}`}>
      <button className="qa-item-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="qa-question">{question}</span>
        <svg 
          className="qa-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="qa-item-body">
        <div className="qa-item-content">
          <p className="qa-answer">{answer}</p>
          {isLast && (
            <div className="qa-actions">
              <button className="btn-secondary qa-action-btn" onClick={handleCopyLink}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>{isArabic ? "زيارة الرابط" : "Visit Link"}</span>
              </button>
              <button className="btn-secondary qa-action-btn" onClick={handleCopyEmail}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>{isArabic ? "إرسال بريد" : "Send Email"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QAPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const qaItemsAr = [
    {
      question: "عن المؤلف؟",
      answer: "لا يهم من أنا! يمكنك التعرف علي باسم “زكّار”، وهو لقب اقتبسته وله دلالة على وظيفتي هنا؛ بأن أُذكّرك دوماً أن تعيش الحاضر وتولد من جديد في كل لحظة دون التعلق بأي ماضٍ أو ما هو قديم. وبالتالي، التحرر من قلق المستقبل وأوجاع التفكير القسري اللاإرادي الناتج عن الانغماس في ذكريات الماضي وخيالات المستقبل. هذا التطبيق سيكون الأداة الرئيسية لهذه المهمة، ترقب القادم وقم بتحديثه باستمرار لكي لا يفوتك أي من الميزات الجديدة التي ستدعمك في رحلة الوعي والحرية النفسية.",
    },
    {
      question: "ما هي موسيقى الترددات (Solfeggio Frequencies)؟",
      answer: "موسيقى الترددات هي نغمات صوتية نقية تتناغم بشكل مباشر مع مراكز الطاقة والمشاعر في أجسادنا. بعيداً عن التعقيدات التقنية، يمكنك تخيلها كموجات لطيفة تلامس وتخاطب حالاتك العاطفية المختلفة؛ فبعض هذه الترددات يساعد على التخلص من الخوف والتوتر، بينما يعمل البعض الآخر على تعزيز مشاعر الحب، والسلام الداخلي، والشفاء العاطفي، مما يمنحك المساحة الآمنة لتجاوز المشاعر السلبية المتراكمة.\n\nطريقة الاستخدام: للحصول على أفضل النتائج، نوصي بالاستماع إلى هذه الترددات في بيئة هادئة لمدة تتراوح بين 15 إلى 30 دقيقة يومياً. يمكنك ببساطة تركها كخلفية صوتية أثناء الاسترخاء أو قبل النوم لتسمح لذبذباتها بإعادة ضبط حالتك النفسية بسلام.",
    },
    {
      question: "ما أهمية تمارين التنفس؟",
      answer: "نميل نحن البشر، في زحمة الحياة، إلى نسيان الانتباه إلى أبسط وأهم وظيفة تبقينا على قيد الحياة: التنفس! إن ممارسة طرق التنفس المقترحة في هذا التطبيق تبني جذوراً صلبة وتغير من حالتك النفسية والفيزيولوجية بشكل فوري. فالتنفس مرتبط ارتباطاً وثيقاً بحالتنا الذهنية؛ ولهذا السبب تجد نفسك تتنفس بسرعة وسطحية عند الشعور بالغضب أو القلق، بينما يصبح تنفسك بطيئاً وعميقاً عندما تكون هادئاً ومطمئناً.\n\nالاستمرارية والنتائج: تتطلب معظم هذه التمارين من 5 إلى 10 دقائق فقط يومياً، ورغم قصر مدتها، إلا أنها قادرة على إحداث تأثير إيجابي وسريع. من الجيد ممارستها بانتظام، وننصحك بالاستمرار عليها من 3 إلى 6 أسابيع متتالية لتشهد تحولاً جذرياً وتستمتع بفوائدها الكاملة على صفائك الذهني.",
    },
    {
      question: "هل هذه النسخة النهائية من التطبيق؟",
      answer: "بالطبع لا! هذه مجرد البداية. سنقوم قريباً بنشر مجموعة من التمارين والطرق الحصرية والمتقدمة. تأكد من تحديث التطبيق باستمرار لتبقى على اطلاع وتستفيد من أحدث الإضافات والميزات فور صدورها.",
    },
    {
      question: "أين يمكن التواصل معك؟",
      answer: "يسعدنا دائماً تواصلك معنا! يمكنك الوصول إلى جميع حساباتنا على وسائل التواصل الاجتماعي، وزيارة موقعنا الإلكتروني، ومعرفة تفاصيل الاتصال من خلال الرابط التالي:\n\nwww.okaz.io/contact\n\nكما نرحب دائماً برسائلك واستفساراتك ومقترحاتك مباشرة عبر البريد الإلكتروني:\n\nsupport@okaz.io",
    },
  ];

  const qaItemsEn = [
    {
      question: "About the Author?",
      answer: "It doesn't matter who I am! You can know me by the name \"Zakkar\", a title I adopted that signifies my purpose here: to always remind you to live in the present and be reborn in every moment without clinging to any past or anything old. Consequently, freeing yourself from future anxiety and the pain of compulsive, involuntary thinking that results from immersion in memories of the past and fantasies of the future. This app will be the main tool for this mission; stay tuned for what's coming and keep it updated so you don't miss any new features that will support you on your journey of awareness and psychological freedom.",
    },
    {
      question: "What are Solfeggio Frequencies?",
      answer: "Frequency music refers to pure sound tones that resonate directly with the energy centers and emotions in our bodies. Beyond technical complexities, you can imagine them as gentle waves that touch and address your different emotional states; some of these frequencies help release fear and tension, while others work to enhance feelings of love, inner peace, and emotional healing, giving you a safe space to transcend accumulated negative emotions.\n\nHow to use: For best results, we recommend listening to these frequencies in a quiet environment for 15 to 30 minutes daily. You can simply leave them as background audio while relaxing or before sleeping to allow their vibrations to peacefully reset your psychological state.",
    },
    {
      question: "What is the importance of breathing exercises?",
      answer: "In the hustle and bustle of life, we humans tend to forget to pay attention to the simplest and most important function that keeps us alive: breathing! Practicing the breathing methods suggested in this app builds strong roots and instantly alters your psychological and physiological state. Breathing is closely linked to our state of mind; this is why you find yourself breathing quickly and shallowly when feeling angry or anxious, while your breathing becomes slow and deep when you are calm and reassured.\n\nConsistency and results: Most of these exercises require only 5 to 10 minutes a day, and despite their short duration, they are capable of producing a quick and positive impact. It is good to practice them regularly, and we advise you to continue for 3 to 6 consecutive weeks to witness a radical transformation and enjoy their full benefits on your mental clarity.",
    },
    {
      question: "Is this the final version of the app?",
      answer: "Of course not! This is just the beginning. We will soon publish a selection of exclusive and advanced exercises and methods. Make sure to keep the app updated to stay informed and benefit from the latest additions and features as soon as they are released.",
    },
    {
      question: "Where can we contact you?",
      answer: "We are always happy to connect with you! You can access all our social media accounts, visit our website, and find contact details through the following link:\n\nwww.okaz.io/contact\n\nWe also always welcome your messages, inquiries, and suggestions directly via email at:\n\nsupport@okaz.io",
    },
  ];

  const items = isArabic ? qaItemsAr : qaItemsEn;

  return (
    <div className="qa-page">
      <header className="qa-header">
        <h1 className="qa-title">{t('titleQA')}</h1>
      </header>

      <div className="qa-container">
        {items.map((item, index) => (
          <QAItem 
            key={index} 
            question={item.question} 
            answer={item.answer} 
            isLast={index === items.length - 1}
            isArabic={isArabic}
          />
        ))}
      </div>
    </div>
  );
}
