import { CopyContact } from '#app/features/copy-contact/CopyContact';
import '#app/widgets/contacts-bar/contacts-bar.css';

const EMAIL = 'hello@selfskills.dev';
const TELEGRAM = '#contact';
const GITHUB = 'https://github.com/thisVioletHydra';

export function ContactsBar() {
  return (
    <section className="cosmos-section" id="contact">
      <div className="stars" aria-hidden="true" />
      <div className="inner">
        <p className="tag">contact</p>
        <h2 className="title">Написать</h2>
        <p className="sub">Без форм на сорок полей — просто канал.</p>

        <div className="contacts">
          <CopyContact value={EMAIL} label={EMAIL} className="action" />
          <a className="action" href={TELEGRAM}>
            Telegram
          </a>
          <a className="action" href={GITHUB} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
