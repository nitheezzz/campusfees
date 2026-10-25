import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <main className="maintenance-shell" aria-labelledby="maintenance-title">
      <div className="maintenance-backdrop" aria-hidden="true" />

      <header className="maintenance-header">
        <div className="maintenance-brand">
          <img src="/fee-mark.svg" alt="" />
          <span>
            <strong>Student Fee Management</strong>
            <small>STUDENT SERVICES</small>
          </span>
        </div>
        <div className="maintenance-status" role="status">
          <span className="maintenance-status-dot" aria-hidden="true" />
          System maintenance
        </div>
      </header>

      <section className="maintenance-content">
        <div className="maintenance-message">
          <p className="maintenance-eyebrow">
            <span aria-hidden="true" /> SERVICE UPDATE
          </p>
          <h1 id="maintenance-title">
            We’ll be back <span>soon.</span>
          </h1>
          <p className="maintenance-description">
            Student Fee Management is temporarily unavailable while we carry out
            maintenance. Please check back later. Thank you for your patience.
          </p>

          <div className="maintenance-notice">
            <span className="maintenance-notice-icon" aria-hidden="true">
              <Wrench size={19} strokeWidth={1.8} />
            </span>
            <span>
              <strong>Maintenance in progress</strong>
              <small>Fee management services are temporarily offline.</small>
            </span>
          </div>
        </div>

        <div className="maintenance-visual" aria-hidden="true">
          <div className="maintenance-orbit maintenance-orbit-outer" />
          <div className="maintenance-orbit maintenance-orbit-inner" />
          <div className="maintenance-service-card">
            <div className="maintenance-card-brand">
              <img src="/fee-mark.svg" alt="" />
              <span>STUDENT FEE MANAGEMENT</span>
            </div>
            <div className="maintenance-card-rule" />
            <div className="maintenance-card-state">
              <span className="maintenance-card-state-dot" />
              TEMPORARILY OFFLINE
            </div>
            <div className="maintenance-card-lines">
              <span />
              <span />
              <span />
            </div>
            <div className="maintenance-card-foot">
              <span>Service status</span>
              <span>Maintenance</span>
            </div>
          </div>
          <div className="maintenance-tool-badge">
            <Wrench size={21} strokeWidth={1.8} />
          </div>
          <span className="maintenance-spark maintenance-spark-one" />
          <span className="maintenance-spark maintenance-spark-two" />
        </div>
      </section>

      <footer className="maintenance-footer">
        <span>Student Fee Management</span>
        <span>Thank you for your patience</span>
      </footer>
    </main>
  );
}
