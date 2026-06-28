import { useTranslations, useLocale } from 'next-intl';
import './privacy.css';

export default function PrivacyPage() {
  const t = useTranslations();
  const locale = useLocale();

  if (locale === 'en') {
    return (
      <div className="privacy-page">
        <div className="privacy-container glass-card" dir="ltr">
          <h1 className="privacy-title">Privacy Policy for “Okaz” App & Website</h1>
          <p className="privacy-date">Last Updated: June 2026</p>

          <div className="privacy-content">
            <section>
              <h2>1. Introduction</h2>
              <p>Welcome to “Okaz” (referred to as “we”, “App”, or “Platform”), developed and managed by Zack Abasi.</p>
              <p>We respect your privacy and are strongly committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use our mobile app (iOS and Android) and website, in compliance with the General Data Protection Regulation (GDPR) and applicable privacy laws of Apple and Google stores.</p>
              <p>By using the “Okaz” App, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please stop using the App and Website.</p>
            </section>
            
            <section>
              <h2>2. Data We Collect</h2>
              <p>We adhere to the principle of "Data Minimization", collecting only the necessary information to provide the services:</p>
              <ul>
                <li><strong>Information you provide voluntarily:</strong> When creating an account (if applicable) or contacting us via the contact form, we may collect data such as Name and Email.</li>
                <li><strong>Usage Data:</strong> We automatically collect information about how you interact with the App to improve the experience, such as: the exercises you practice (like 478, Box Breathing), sleep timer statistics, and app usage duration.</li>
                <li><strong>Device Data:</strong> We may collect non-identifiable information such as device type, operating system, and preferred language to ensure compatibility and optimal performance.</li>
              </ul>
              <p><em>(Important Note: The “Okaz” App does NOT collect any medical data, audio recordings, or precise geolocation data).</em></p>
            </section>
            
            <section>
              <h2>3. How We Use Your Data</h2>
              <p>We use the collected data for the following specific purposes only:</p>
              <ul>
                <li><strong>Operating the Service:</strong> To provide videos, audio clips, Present Moment Reminders, and enable the sleep timer to function correctly.</li>
                <li><strong>Improving the App:</strong> To analyze how users interact with the content in order to develop and add new features (such as improving the Solfeggio frequencies music experience).</li>
                <li><strong>Support & Communication:</strong> To respond to your inquiries, provide technical support, and send administrative updates (like notifications about Terms of Service changes).</li>
              </ul>
            </section>
            
            <section>
              <h2>4. Sharing Data with Third Parties</h2>
              <p>We absolutely do not sell your personal data to any party. We may share data only with trusted third parties to the extent necessary to operate the service, including:</p>
              <ul>
                <li><strong>Analytics and Hosting Providers:</strong> We may use services like Google Analytics or Firebase or web hosting services (such as linked platforms) to understand how the app performs.</li>
                <li><strong>App Stores:</strong> Apple (App Store) and Google (Play Store) may collect some anonymous analytics data independently in accordance with their respective privacy policies.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your data if required to do so by law or in response to valid requests by public authorities.</li>
              </ul>
            </section>
            
            <section>
              <h2>5. Your Rights under the GDPR</h2>
              <p>If you are a resident of the European Economic Area (EEA) or other regions subject to GDPR, you have the following rights:</p>
              <ul>
                <li><strong>Right of Access:</strong> You have the right to request a copy of your personal data that we hold.</li>
                <li><strong>Right to Rectification:</strong> You have the right to request correction of any inaccurate or incomplete data.</li>
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You have the right to request that we erase your personal data from our systems permanently.</li>
                <li><strong>Right to Withdraw Consent:</strong> You have the right to withdraw your consent to data processing at any time, without affecting the lawfulness of processing based on consent before its withdrawal.</li>
              </ul>
              <p>To exercise any of these rights, please contact us using the contact information provided below.</p>
            </section>
            
            <section>
              <h2>6. Data Retention & Deletion</h2>
              <ul>
                <li><strong>Retention Period:</strong> We retain your personal data only as long as necessary for the purposes set out in this policy, or to comply with our legal obligations.</li>
                <li><strong>Account and Data Deletion:</strong> Our platform complies with Google and Apple store requirements to have a data deletion mechanism. Users have the right to request the deletion of their accounts and all associated data at any time through the app settings or by contacting us directly. Upon receiving a deletion request, your data will be permanently wiped from our active systems within a period not exceeding 30 days.</li>
              </ul>
            </section>
            
            <section>
              <h2>7. Data Security</h2>
              <p>We place the security of your data as our top priority. We use industry-standard technical and organizational security measures (such as encryption and secure communications) to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
            </section>
            
            <section>
              <h2>8. Children's Privacy</h2>
              <p>The “Okaz” App does not target children under the age of 13. We do not knowingly collect any personal information from children. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we discover that we have collected personal information from a child without parental consent, we will take immediate steps to remove that information from our servers.</p>
            </section>
            
            <section>
              <h2>9. Changes to Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal and regulatory reasons. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date at the top. We encourage you to review this page periodically.</p>
            </section>
            
            <section>
              <h2>10. Contact Information</h2>
              <p>If you have any questions or concerns about this Privacy Policy, our data handling practices, or if you wish to exercise your rights as a user, please contact us:</p>
              <ul>
                <li><strong>Developer:</strong> Zack Abasi</li>
                <li><strong>Contact Link:</strong> <a href="https://okaz.io/contact" target="_blank" rel="noopener noreferrer">https://okaz.io/contact</a></li>
                <li><strong>Email:</strong> <a href="mailto:support@okaz.io">support@okaz.io</a></li>
              </ul>
              <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>© 2026 - Okaz</p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="privacy-page">
      <div className="privacy-container glass-card" dir="rtl">
        <h1 className="privacy-title">سياسة الخصوصية لتطبيق وموقع “عكاظ” (Okaz)</h1>
        <p className="privacy-date">تاريخ آخر تحديث: يونيو 2026</p>

        <div className="privacy-content">
          <section>
            <h2>1. مقدمة</h2>
            <p>مرحباً بكم في “عكاظ” (Okaz) (يُشار إليه بـ “نحن” أو “التطبيق” أو “المنصة”)، المُطوّر والمُدار بواسطة Zack Abasi.</p>
            <p>نحن نحترم خصوصيتك ونلتزم بشدة بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا، واستخدامنا، ومشاركتنا، وحمايتنا لمعلوماتك عند استخدامك لتطبيقنا على الأجهزة المحمولة (iOS و Android) وموقعنا الإلكتروني، وذلك امتثالاً للائحة الأوروبية العامة لحماية البيانات (GDPR) وقوانين الخصوصية المعمول بها في متجري Apple و Google.</p>
            <p>بمجرد استخدامك لتطبيق “عكاظ”، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة. إذا كنت لا توافق على هذه السياسة، يُرجى التوقف عن استخدام التطبيق والموقع.</p>
          </section>

          <section>
            <h2>2. البيانات التي نجمعها</h2>
            <p>نحن نلتزم بمبدأ “تقليل البيانات” (Data Minimization)، حيث لا نجمع سوى المعلومات الضرورية لتقديم الخدمات:</p>
            <ul>
              <li><strong>المعلومات التي تقدمها طواعية:</strong> عند إنشاء حساب (إن وُجد) أو التواصل معنا عبر نموذج الاتصال، قد نجمع بيانات مثل الاسم، والبريد الإلكتروني.</li>
              <li><strong>بيانات الاستخدام (Usage Data):</strong> نجمع معلومات تلقائية حول كيفية تفاعلك مع التطبيق لتحسين التجربة، مثل: التمارين التي تمارسها (مثل 478، Box Breathing)، إحصائيات مؤقت النوم، ومدة استخدام التطبيق.</li>
              <li><strong>بيانات الجهاز:</strong> قد نجمع معلومات غير محددة للهوية مثل نوع الجهاز، ونظام التشغيل، واللغة المفضلة لضمان التوافق والأداء الأمثل.</li>
            </ul>
            <p><em>(ملاحظة هامة: لا يقوم تطبيق “عكاظ” بجمع أي بيانات طبية، أو تسجيلات صوتية، أو بيانات موقع جغرافي دقيق).</em></p>
          </section>

          <section>
            <h2>3. كيف نستخدم بياناتك</h2>
            <p>نحن نستخدم البيانات التي نجمعها للأغراض المحددة التالية فقط:</p>
            <ul>
              <li><strong>تشغيل الخدمة:</strong> لتقديم مقاطع الفيديو، والمقاطع الصوتية، وتنبيهات اللحظة الحالية (Present Moment Reminders)، وتمكين عمل مؤقت النوم بشكل صحيح.</li>
              <li><strong>تحسين التطبيق:</strong> لتحليل كيفية تفاعل المستخدمين مع المحتوى بغرض تطوير وإضافة ميزات جديدة (مثل تحسين تجربة الموسيقى الترددية Solfeggio).</li>
              <li><strong>الدعم والتواصل:</strong> للرد على استفساراتك، وتقديم الدعم الفني، وإرسال تحديثات إدارية (مثل الإشعارات حول تغيير شروط الخدمة).</li>
            </ul>
          </section>

          <section>
            <h2>4. مشاركة البيانات مع أطراف ثالثة</h2>
            <p>نحن لا نبيع بياناتك الشخصية لأي جهة إطلاقاً. قد نشارك البيانات فقط مع الأطراف الثالثة الموثوقة بالقدر اللازم لتشغيل الخدمة، وتشمل:</p>
            <ul>
              <li><strong>مقدمو خدمات التحليل والاستضافة:</strong> قد نستخدم خدمات مثل Google Analytics أو Firebase أو خدمات استضافة الويب (مثل المنصات المرتبطة) لمعرفة كيفية أداء التطبيق.</li>
              <li><strong>متاجر التطبيقات:</strong> قد تقوم شركة Apple (في App Store) وشركة Google (في Play Store) بجمع بعض بيانات التحليل المجهولة بشكل مستقل وفقاً لسياسات الخصوصية الخاصة بهما.</li>
              <li><strong>المتطلبات القانونية:</strong> قد نفصح عن بياناتك إذا طلب منا ذلك بموجب القانون أو استجابة لطلبات قانونية صالحة من السلطات العامة.</li>
            </ul>
          </section>

          <section>
            <h2>5. حقوقك بموجب اللائحة العامة لحماية البيانات (GDPR)</h2>
            <p>إذا كنت مقيماً في المنطقة الاقتصادية الأوروبية (EEA) أو غيرها من المناطق الخاضعة للـ GDPR، فإنك تتمتع بالحقوق التالية:</p>
            <ul>
              <li><strong>حق الوصول:</strong> يحق لك طلب نسخة من بياناتك الشخصية التي نحتفظ بها.</li>
              <li><strong>حق التصحيح:</strong> يحق لك طلب تصحيح أي بيانات غير دقيقة أو غير مكتملة.</li>
              <li><strong>حق الحذف (“الحق في النسيان”):</strong> يحق لك مطالبتنا بمسح بياناتك الشخصية من أنظمتنا نهائياً.</li>
              <li><strong>حق سحب الموافقة:</strong> يحق لك سحب موافقتك على معالجة البيانات في أي وقت، دون أن يؤثر ذلك على قانونية المعالجة قبل السحب.</li>
            </ul>
            <p>لممارسة أي من هذه الحقوق، يُرجى التواصل معنا عبر بيانات الاتصال الموضحة أدناه.</p>
          </section>

          <section>
            <h2>6. الاحتفاظ بالبيانات وسياسة الحذف (Data Retention & Deletion)</h2>
            <ul>
              <li><strong>مدة الاحتفاظ:</strong> نحتفظ ببياناتك الشخصية فقط طالما كانت ضرورية للأغراض المنصوص عليها في هذه السياسة، أو للامتثال لالتزاماتنا القانونية.</li>
              <li><strong>حذف الحساب والبيانات:</strong> تتوافق منصتنا مع متطلبات متجري Google و Apple التي تلزم بوجود آلية لحذف البيانات. يحق للمستخدمين طلب حذف حساباتهم وجميع البيانات المرتبطة بها في أي وقت من خلال إعدادات التطبيق أو عبر التواصل معنا مباشرة. بمجرد استلام طلب الحذف، سيتم مسح بياناتك نهائياً من أنظمتنا النشطة خلال فترة لا تتجاوز 30 يوماً.</li>
            </ul>
          </section>

          <section>
            <h2>7. أمن البيانات (Data Security)</h2>
            <p>نحن نضع أمن بياناتك على رأس أولوياتنا. نستخدم تدابير أمنية، وتقنية، وتنظيمية متوافقة مع معايير الصناعة (مثل التشفير وتأمين الاتصالات) لحماية بياناتك الشخصية من الوصول غير المصرح به، أو التعديل، أو الكشف، أو التدمير. ومع ذلك، يُرجى ملاحظة أنه لا توجد وسيلة نقل عبر الإنترنت أو طريقة تخزين إلكتروني آمنة بنسبة 100%.</p>
          </section>

          <section>
            <h2>8. خصوصية الأطفال (Children’s Privacy)</h2>
            <p>لا يستهدف تطبيق “عكاظ” الأطفال الذين تقل أعمارهم عن 13 عاماً. نحن لا نجمع عن قصد أي معلومات شخصية من الأطفال. إذا كنت والداً أو وصياً وكنت على علم بأن طفلك قد زودنا ببيانات شخصية، يُرجى الاتصال بنا. إذا اكتشفنا أننا جمعنا معلومات شخصية من طفل دون موافقة الوالدين، فسنتخذ الخطوات الفورية لإزالة تلك المعلومات من خوادمنا.</p>
          </section>

          <section>
            <h2>9. التغييرات على سياسة الخصوصية</h2>
            <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو للأسباب القانونية والتنظيمية. سنقوم بإعلامك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث “تاريخ آخر تحديث” في الأعلى. نُشجعك على مراجعة هذه الصفحة بشكل دوري.</p>
          </section>

          <section>
            <h2>10. معلومات الاتصال</h2>
            <p>إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه، أو سياسات التعامل مع البيانات، أو إذا كنت ترغب في ممارسة حقوقك كمستخدم، يُرجى التواصل معنا:</p>
            <ul>
              <li><strong>المطور:</strong> Zack Abasi</li>
              <li><strong>رابط التواصل:</strong> <a href="https://okaz.io/contact" target="_blank" rel="noopener noreferrer">https://okaz.io/contact</a></li>
              <li><strong>البريد الإلكتروني:</strong> <a href="mailto:support@okaz.io">support@okaz.io</a></li>
            </ul>
            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>© 2026 - Okaz عكاظ</p>
          </section>
        </div>
      </div>
    </div>
  );
}
