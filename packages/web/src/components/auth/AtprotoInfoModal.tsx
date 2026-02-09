import { useRef, useEffect } from 'react';
import styles from './AtprotoInfoModal.module.css';

interface AtprotoInfoModalProps {
  onClose: () => void;
}

const BLACKSKY_PDS = {
  name: 'blacksky.app',
  url: 'https://blacksky.community',
  description:
    'A community-run PDS democratizing the protocol and building safe spaces. Please follow the rules and boundaries set up by their team. Run by Blacksky Algorithms.',
  warning:
    'This PDS is reserved for Black folks building communal infrastructure. Anyone else using a blacksky.app handle will receive a warning and then a suspension.',
};

const OPEN_PDS_PROVIDERS = [
  {
    name: 'bsky.social',
    url: 'https://bsky.app',
    description: 'Run by the Bluesky team.',
  },
  {
    name: 'fed.brid.gy',
    url: 'https://fed.brid.gy',
    description: 'Bridges your account to the Fediverse (Mastodon, etc.).',
  },
];

const COMMUNITY_PDS_PROVIDERS = [
  BLACKSKY_PDS,
  {
    name: 'myatproto.social and cryptoanarchy.network',
    url: 'https://blacksky.community',
    description:
      'Blacksky Algorithms also operates PDSs that are open to anyone. These run on the same infrastructure as blacksky.app and are maintained by the same innovative team.',
  },
  {
    name: 'transrights.northsky.social',
    url: 'https://northsky.social',
    description:
      'A digital space designed around active moderation and user safety for 2SLGBTQIA+ communities. Run by Northsky Social Cooperative.',
  },
  {
    name: 'pds.witchcraft.systems',
    url: 'https://witchcraft.systems',
    description: 'Contact directly for invite.',
  },
  {
    name: 'selfhosted.social',
    url: 'https://selfhosted.social',
    description: 'Contact directly for invite.',
  },
];

export function AtprotoInfoModal({ onClose }: AtprotoInfoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose}>
      <div className={styles.titleBar}>What is ATProto?</div>
      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.heading}>The short version</h3>
          <p className={styles.text}>
            The AT Protocol is an open standard for social networking. Instead of one company owning
            your account and data, you choose a server (called a{' '}
            <strong>Personal Data Server</strong>, or PDS) to host your identity. You can then use
            that same account across any app built on the protocol — including Chatmosphere.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>Why it matters</h3>
          <ul className={styles.list}>
            <li>
              <strong>You own your identity.</strong> Your handle and data travel with you — switch
              apps or servers anytime.
            </li>
            <li>
              <strong>No lock-in.</strong> Apps built on ATProto can talk to each other. Your
              Chatmosphere buddies are the same people you follow on Bluesky.
            </li>
            <li>
              <strong>Open source.</strong> Anyone can run a server or build an app. No gatekeepers.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>Create an account</h3>
          <p className={styles.text}>
            To use Chatmosphere, you need an ATProto account on any PDS. Some options:
          </p>
        </section>

        {/* <section className={styles.section}>
          <h3 className={styles.heading}>Blacksky Community PDS</h3>
          <a
            className={styles.providerCard}
            href={BLACKSKY_PDS.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.providerName}>{BLACKSKY_PDS.name}</span>
            <span className={styles.providerDesc}>{BLACKSKY_PDS.description}</span>
          </a>
          <p className={styles.warning}>{BLACKSKY_PDS.warning}</p>
        </section> */}

        <section className={styles.section}>
          <h3 className={styles.heading}>Community led PDSs</h3>
          <div className={styles.providers}>
            {COMMUNITY_PDS_PROVIDERS.map((provider) => (
              <a
                key={provider.name}
                className={styles.providerCard}
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.providerName}>{provider.name}</span>
                <span className={styles.providerDesc}>{provider.description}</span>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>Other PDSs</h3>
          <div className={styles.providers}>
            {OPEN_PDS_PROVIDERS.map((provider) => (
              <a
                key={provider.name}
                className={styles.providerCard}
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.providerName}>{provider.name}</span>
                <span className={styles.providerDesc}>{provider.description}</span>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.text}>
            Chatmosphere is not affiliated with any PDS provider. We are a community-run project
            building on the AT Protocol.
          </p>
        </section>

        <p className={styles.text}>
          Once you have an account, come back here and sign in with your handle (e.g.{' '}
          <strong>yourname.myatproto.social</strong>).
        </p>

        <button
          className={styles.closeButton}
          type="button"
          onClick={() => {
            dialogRef.current?.close();
          }}
        >
          Got it
        </button>
      </div>
    </dialog>
  );
}
