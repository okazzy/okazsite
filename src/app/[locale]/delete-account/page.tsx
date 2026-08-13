import { useLocale } from 'next-intl';
import './delete-account.css';

export default function DeleteAccountPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="delete-account-page" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="delete-header">
        <img src="/logo.png" alt="Okaz" className="delete-logo" />
        <h1 className="delete-title">Account Deletion Request</h1>
        <h2 className="delete-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>طلب حذف الحساب</h2>
        <p className="delete-subtitle">
          Submit a request to permanently delete your Okaz account and associated data.
          <br />
          قدم طلبًا لحذف حساب عكاظ الخاص بك والبيانات المرتبطة به نهائيًا.
        </p>
      </header>

      <div className="delete-content">
        <h2>What will be deleted? (ما الذي سيتم حذفه؟)</h2>
        <p>
          When you request account deletion, we will permanently delete the following data associated with your account:
          <br />
          عند طلب حذف الحساب، سنقوم بحذف البيانات التالية المرتبطة بحسابك نهائيًا:
        </p>
        <ul>
          <li>Your personal profile information (name, email, profile picture) <br/> معلومات ملفك الشخصي (الاسم، البريد الإلكتروني، الصورة)</li>
          <li>Your viewing and listening history <br/> سجل المشاهدة والاستماع الخاص بك</li>
          <li>Your saved favorites and preferences <br/> مفضلاتك المحفوظة وتفضيلاتك</li>
          <li>Your premium subscription status (if any) <br/> حالة اشتراكك المميز (إن وجد)</li>
        </ul>
        <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>
          Warning: This action cannot be undone. Once your account is deleted, you will lose access to all your saved data and premium content.
          <br />
          تحذير: لا يمكن التراجع عن هذا الإجراء. بمجرد حذف حسابك، ستفقد إمكانية الوصول إلى جميع بياناتك المحفوظة والمحتوى المميز.
        </p>
      </div>

      <div className="delete-content">
        <h2>Submit Deletion Request (تقديم طلب الحذف)</h2>
        <p>
          Please enter the email address associated with your Okaz account. Our support team will process your request within 3-5 business days.
          <br />
          يرجى إدخال عنوان البريد الإلكتروني المرتبط بحساب عكاظ الخاص بك. سيقوم فريق الدعم لدينا بمعالجة طلبك خلال 3-5 أيام عمل.
        </p>

        <form className="delete-form" action="https://api.web3forms.com/submit" method="POST">
          <input type="hidden" name="access_key" value="327ddac0-904b-4a17-9eb2-c7bcc68679fb" />
          <input type="hidden" name="subject" value="Account Deletion Request - Okaz" />
          <input type="hidden" name="from_name" value="Okaz Account Deletion" />

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Account Email Address (البريد الإلكتروني للحساب)<span className="form-label-required">*</span>
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="form-input" 
              placeholder="Enter your email / أدخل بريدك الإلكتروني" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason" className="form-label">
              Reason for leaving (Optional) / سبب المغادرة (اختياري)
            </label>
            <input 
              type="text" 
              id="reason" 
              name="reason" 
              className="form-input" 
            />
          </div>

          <button type="submit" className="form-submit-btn">
            Request Account Deletion / طلب حذف الحساب
          </button>
        </form>
      </div>
    </div>
  );
}
