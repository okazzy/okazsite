import { useTranslations, useLocale } from 'next-intl';
import './terms.css';

export default function TermsPage() {
  const t = useTranslations();
  const locale = useLocale();

  if (locale === 'en') {
    return (
      <div className="terms-page">
        <div className="terms-container glass-card" dir="ltr">
          <h1 className="terms-title">Terms of Service for “Okaz” App & Website</h1>
          <p className="terms-date">Last Updated: June 2026</p>

          <div className="terms-content">
            <p>Welcome to Okaz. Please read these Terms of Service (“Terms”) carefully before using our website and mobile application (collectively referred to as the “Service” or “Platform”).</p>
            <p>By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the terms, you may not access the Service.</p>

            <section>
              <h2>1. Medical and Health Disclaimer (Very Important)</h2>
              <ul>
                <li><strong>Not Medical Advice:</strong> The content provided via the “Okaz” App and Website, including breathing exercises (such as 478, Box Breathing, HRV), audio clips, Solfeggio frequencies music, and general advice, is for educational, awareness, and general well-being purposes only. This content does not constitute, and should not be construed as, medical advice, diagnosis, or treatment for any health or mental condition.</li>
                <li><strong>User Responsibility:</strong> It is solely the user's responsibility to research and verify the suitability of these exercises for their general health condition.</li>
                <li><strong>Consulting Professionals:</strong> You should always consult a doctor, qualified healthcare provider, or specialist before starting any new breathing or meditation practice, especially if you have any pre-existing medical conditions, respiratory diseases, heart problems, or if you are pregnant.</li>
                <li><strong>Immediate Discontinuation:</strong> If you experience any dizziness, shortness of breath, pain, or discomfort while practicing any breathing exercise within the App, you must stop immediately and consult a medical specialist. Your continued use of the Service is entirely at your own risk.</li>
              </ul>
            </section>

            <section>
              <h2>2. Eligibility and Account Creation</h2>
              <ul>
                <li><strong>Legal Age:</strong> By using the Service, you represent that you are at least 13 years old (or the minimum legal age in your country). If you are under the legal age, the App must be used under the supervision of a parent or legal guardian.</li>
                <li><strong>Account Security:</strong> If the App requires creating an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </section>

            <section>
              <h2>3. GDPR Compliance and Data Protection</h2>
              <p>We are committed to protecting your privacy and personal data in accordance with global standards, including the General Data Protection Regulation (GDPR):</p>
              <ul>
                <li><strong>Data Collection:</strong> We collect and process only the essential data needed to operate the App and improve your experience (such as usage preferences and timer data).</li>
                <li><strong>Your Rights:</strong> You have the right at any time to access, rectify, or request erasure of your personal data ("Right to be Forgotten"), restrict processing, or withdraw your consent.</li>
                <li><strong>Additional Details:</strong> Please review our Privacy Policy for detailed information on how we collect, use, and protect your data.</li>
              </ul>
            </section>

            <section>
              <h2>4. Intellectual Property</h2>
              <p>All materials and content available on the Service, including but not limited to: text, designs, icons, videos, audio clips, music (including 528Hz and other integrated frequencies), software, and logos, are the exclusive intellectual property of the “Okaz” platform or licensed to it, and are protected by international copyright and intellectual property laws.</p>
              <p>The user is granted a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial use only. It is strictly prohibited to copy, reproduce, distribute, sell, or reverse engineer any part of the Service without our prior written permission.</p>
            </section>

            <section>
              <h2>5. Subscriptions and Paid Services (Freemium)</h2>
              <ul>
                <li>The “Okaz” App provides a model that combines free and paid services. Free content is available to all users in accordance with current Terms of Use.</li>
                <li>In the event of subscribing to Premium content in the future, automatic payment and renewal processes will be subject to the payment terms of the respective app store (Apple App Store or Google Play Store).</li>
              </ul>
            </section>

            <section>
              <h2>6. Limitation of Liability</h2>
              <p>To the maximum extent permitted by applicable law, the “Okaz” platform, its founders, employees, or partners shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or related to your use of or inability to use the Service, including any health deterioration resulting from failure to adhere to medical guidelines or misuse of breathing exercises.</p>
            </section>

            <section>
              <h2>7. Modification of Services and Terms</h2>
              <p>We reserve the right to modify or discontinue the Service (or any part thereof) at any time and without prior notice. We also reserve the right to update these Terms of Service from time to time, and users will be notified of any material changes via the App or Website. Your continued use of the Service after modifications constitutes your acceptance of the new Terms.</p>
            </section>

            <section>
              <h2>8. Governing Law and Dispute Resolution</h2>
              <p>These Terms shall be governed and construed in accordance with applicable local laws (you can specify the country of incorporation here, e.g., the laws of the Republic of Ireland for GDPR compliance). Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the competent courts.</p>
            </section>

            <section>
              <h2>9. Contact Information</h2>
              <p>If you have any questions or concerns regarding these Terms of Service, or if you wish to make a request regarding your personal data, please contact us via the contact form on our website at <a href="https://okaz.io/contact" target="_blank" rel="noopener noreferrer">https://okaz.io/contact</a>.</p>
              <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>© 2026 - Okaz</p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terms-page">
      <div className="terms-container glass-card" dir="rtl">
        <h1 className="terms-title">شروط وأحكام الخدمة لتطبيق وموقع “عكاظ” (Okaz)</h1>
        <p className="terms-date">تاريخ آخر تحديث: يونيو 2026</p>

        <div className="terms-content">
          <p>مرحباً بكم في عكاظ (Okaz). يُرجى قراءة شروط الخدمة هذه (“الشروط”) بعناية قبل استخدام الموقع الإلكتروني وتطبيق الهاتف المحمول الخاص بنا (المشار إليهما معاً بـ “الخدمة” أو “المنصة”).</p>
          <p>بمجرد وصولك إلى الخدمة أو استخدامها، فإنك توافق على الالتزام بهذه الشروط وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يحق لك استخدام الخدمة.</p>

          <section>
            <h2>1. إخلاء المسؤولية الطبية والصحية (هام جداً)</h2>
            <ul>
              <li><strong>ليست نصيحة طبية:</strong> المحتوى المقدم عبر تطبيق وموقع “عكاظ”، بما في ذلك تمارين التنفس (مثل 478، Box Breathing، HRV)، والمقاطع الصوتية، والموسيقى الترددية (Solfeggio Frequencies)، والنصائح العامة، هو بغرض التثقيف والتوعية والرفاهية العامة فقط. لا يشكل هذا المحتوى، ولا ينبغي اعتباره، نصيحة طبية أو تشخيصاً أو علاجاً لأي حالة صحية أو نفسية.</li>
              <li><strong>مسؤولية المستخدم:</strong> تقع على عاتق المستخدم وحده مسؤولية البحث والتحقق من ملاءمة هذه التمارين لحالته الصحية العامة.</li>
              <li><strong>استشارة المتخصصين:</strong> يجب عليك دائماً استشارة الطبيب أو مقدم الرعاية الصحية المؤهل أو الاختصاصي قبل البدء في أي ممارسة جديدة للتنفس أو التأمل، خاصة إذا كنت تعاني من أي حالة طبية مسبقة، أو أمراض تنفسية، أو مشاكل في القلب، أو في حالة الحمل.</li>
              <li><strong>التوقف الفوري:</strong> إذا شعرت بأي دوار، ضيق في التنفس، ألم، أو عدم ارتياح أثناء ممارسة أي تمرين تنفس داخل التطبيق، يجب عليك التوقف فوراً واستشارة طبيب مختص. استمرارك في استخدام الخدمة يكون بالكامل على مسؤوليتك الشخصية.</li>
            </ul>
          </section>

          <section>
            <h2>2. الأهلية وإنشاء الحساب</h2>
            <ul>
              <li><strong>العمر القانوني:</strong> باستخدامك للخدمة، فإنك تقر بأن عمرك لا يقل عن 13 عاماً (أو السن القانوني الأدنى في بلدك). إذا كنت تحت السن القانوني، فيجب استخدام التطبيق تحت إشراف أحد الوالدين أو الوصي القانوني.</li>
              <li><strong>أمن الحساب:</strong> في حال تطلّب التطبيق إنشاء حساب، فأنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تحدث بموجبه. يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.</li>
            </ul>
          </section>

          <section>
            <h2>3. الامتثال للائحة العامة لحماية البيانات (GDPR) وحماية البيانات</h2>
            <p>نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية وفقاً للمعايير العالمية بما فيها اللائحة الأوروبية العامة لحماية البيانات (GDPR):</p>
            <ul>
              <li><strong>جمع البيانات:</strong> نقوم بجمع ومعالجة البيانات الأساسية اللازمة لتشغيل التطبيق وتحسين تجربتك فقط (مثل تفضيلات الاستخدام، وبيانات المؤقت).</li>
              <li><strong>حقوقك:</strong> يحق لك في أي وقت الوصول إلى بياناتك الشخصية، أو تصحيحها، أو طلب مسحها (“حق النسيان”)، أو تقييد معالجتها، أو سحب موافقتك.</li>
              <li><strong>تفاصيل إضافية:</strong> يُرجى مراجعة سياسة الخصوصية (Privacy Policy) الخاصة بنا لمعرفة كيفية جمعنا لبياناتك، واستخدامها، وحمايتها بالتفصيل.</li>
            </ul>
          </section>

          <section>
            <h2>4. الملكية الفكرية</h2>
            <p>جميع المواد والمحتويات المتوفرة في الخدمة، بما في ذلك على سبيل المثال لا الحصر: النصوص، والتصميمات، والرموز، ومقاطع الفيديو، والمقاطع الصوتية، والموسيقى (بما في ذلك المقاطع الصوتية بتردد 528 هرتز والترددات الأخرى المدمجة)، والبرمجيات، والشعارات، هي ملكية فكرية حصرية لمنصة “عكاظ” أو مرخصة لها، ومحمية بموجب قوانين حقوق النشر والالملكية الفكرية الدولية.</p>
            <p>يُمنح المستخدم رخصة محدودة، غير حصرية، وغير قابلة للنقل لاستخدام التطبيق للاستخدام الشخصي غير التجاري فقط. يُحظر تماماً نسخ، أو إعادة إنتاج، أو توزيع، أو بيع، أو هندسة عكسية لأي جزء من الخدمة دون إذن كتابي مسبق منا.</p>
          </section>

          <section>
            <h2>5. الاشتراكات والخدمات المدفوعة (Freemium)</h2>
            <ul>
              <li>يوفر تطبيق “عكاظ” نموذجاً يدمج بين الخدمات المجانية والمدفوعة. المحتوى المجاني متاح لجميع المستخدمين وفقاً لشروط الاستخدام الحالية.</li>
              <li>في حال الاشتراك في المحتوى المميز (Premium) مستقبلاً، ستخضع عمليات الدفع والتجديد التلقائي لشروط الدفع الخاصة بمتجر التطبيقات المعني (Apple App Store أو Google Play Store).</li>
            </ul>
          </section>

          <section>
            <h2>6. تحديد المسؤولية</h2>
            <p>إلى أقصى حد يسمح به القانون المعمول به، لا تتحمل منصة “عكاظ” أو مؤسسوها أو موظفوها أو شركاؤها المسؤولية عن أي أضرار مباشرة، أو غير مباشرة، أو عرضية، أو تبعية، أو خاصة تنشأ عن أو تتعلق باستخدامك للخدمة أو عدم قدرتك على استخدامها، بما في ذلك أي تدهور صحي ناتج عن عدم الالتزام بالتوجيهات الطبية أو إساءة استخدام تمارين التنفس.</p>
          </section>

          <section>
            <h2>7. تعديل الخدمات والشروط</h2>
            <p>نحتفظ بالحق في تعديل أو إيقاف الخدمة (أو أي جزء منها) في أي وقت ودون إشعار مسبق. كما نحتفظ بالحق في تحديث شروط الخدمة هذه من وقت لآخر، وسيتم إخطار المستخدمين بأي تغييرات جوهرية عبر التطبيق أو الموقع الإلكتروني. يُعد استمرارك في استخدام الخدمة بعد التعديل قبولاً منك بالشروط الجديدة.</p>
          </section>

          <section>
            <h2>8. القانون الواجب التطبيق وفض النزاعات</h2>
            <p>تخضع هذه الشروط وتُفسر وفقاً للقوانين المحلية المعمول بها (يمكنك تحديد دولة التأسيس هنا، مثل: قوانين جمهورية أيرلندا للامتثال لـ GDPR). وتخضع أي نزاعات تنشأ عن هذه الشروط للاختصاص القضائي الحصري للمحاكم المختصة.</p>
          </section>

          <section>
            <h2>9. معلومات الاتصال</h2>
            <p>إذا كان لديك أي أسئلة أو استفسارات بشأن شروط الخدمة هذه، أو إذا كنت ترغب في تقديم طلب يخص بياناتك الشخصية، يُرجى التواصل معنا عبر نموذج الاتصال على موقعنا الإلكتروني على الرابط <a href="https://okaz.io/contact" target="_blank" rel="noopener noreferrer">https://okaz.io/contact</a>.</p>
            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>© 2026 - Okaz عكاظ</p>
          </section>
        </div>
      </div>
    </div>
  );
}
