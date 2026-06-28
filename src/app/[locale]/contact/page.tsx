import { Link } from '@/i18n/routing';
import './contact.css';

export default function ContactPage() {
  return (
    <div className="contact-page" dir="rtl">
      <header className="contact-header">
        <img src="/logo.png" alt="عكاظ" className="contact-logo" />
        <h1 className="contact-title">تواصل معنا</h1>
        <p className="contact-subtitle">يرجى ملء النموذج للتواصل مع فريق عكاظ</p>
      </header>

      <form className="contact-form" action="https://api.web3forms.com/submit" method="POST">
        <input type="hidden" name="access_key" value="327ddac0-904b-4a17-9eb2-c7bcc68679fb" />
        <input type="hidden" name="subject" value="New Contact Form Submission - Okaz Web" />
        <input type="hidden" name="from_name" value="Okaz Web Contact Form" />
        {/* Optional: Add a redirect URL if you want a custom success page */}
        {/* <input type="hidden" name="redirect" value="https://yourwebsite.com/success" /> */}

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name (الاسم)<span className="form-label-required">*</span>
          </label>
          <input type="text" id="name" name="name" className="form-input" required />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            البريد الإلكتروني<span className="form-label-required">*</span>
          </label>
          <input type="email" id="email" name="email" className="form-input" placeholder="example@example.com" required />
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            الرسالة<span className="form-label-required">*</span>
          </label>
          <textarea id="message" name="message" className="form-textarea" required></textarea>
        </div>

        <div className="form-checkbox-group">
          <input type="checkbox" id="terms" name="terms" className="form-checkbox" required />
          <label htmlFor="terms" className="form-checkbox-label">
            أوافق على سياسة الخصوصية<span className="form-label-required">*</span>
            <br />
            أوافق على <Link href="/terms">شروط الخدمة</Link> و <Link href="/privacy">سياسة الخصوصية</Link>
          </label>
        </div>

        <p className="form-disclaimer">سيتم استخدام بياناتك فقط للرد على رسالتك، ولن يتم مشاركتها مع أي أطراف أخرى.</p>

        <button type="submit" className="form-submit-btn">إرسال</button>
      </form>
    </div>
  );
}
