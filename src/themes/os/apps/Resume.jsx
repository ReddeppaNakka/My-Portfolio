import { profile } from "../../../data/portfolio";
import { ExternalIcon, FileIcon } from "../../../shell/icons";
import { EXT, useOs } from "../common";

export default function Resume() {
  const { mobile } = useOs();
  const file = profile.resume.split("/").pop();
  return (
    <div className="os-app os-resume">
      <div className="os-resume-bar">
        <span className="os-resume-file">
          <FileIcon size={16} /> {file}
        </span>
        <div className="os-btnrow">
          <a className="os-btn os-btn--primary" href={profile.resume} {...EXT}>
            <ExternalIcon size={15} /> Open in new tab
          </a>
          <a className="os-btn" href={profile.resume} download>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            Download
          </a>
        </div>
      </div>
      {mobile ? (
        <div className="os-resume-card">
          <div className="os-resume-page" aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
          </div>
          <p className="os-p">
            {profile.name} — {profile.title}. Phones preview PDFs best in their own viewer, so open or download it above.
          </p>
        </div>
      ) : (
        <object className="os-resume-frame" data={`${profile.resume}#view=FitH`} type="application/pdf" aria-label={`${profile.name} résumé`}>
          <div className="os-resume-card">
            <p className="os-p">Your browser can't show the PDF inline. Use “Open in new tab” or “Download” above.</p>
          </div>
        </object>
      )}
    </div>
  );
}
