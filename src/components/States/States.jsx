import {
  HiOutlineExclamationCircle,
  HiOutlineHeart,
  HiOutlineSearch,
} from "react-icons/hi";

const ICONS = {
  search: HiOutlineSearch,
  error: HiOutlineExclamationCircle,
  heart: HiOutlineHeart,
};

export function StateMessage({ icon = "search", tone = "neutral", title, children, actions, headingLevel = 2 }) {
  const Icon = ICONS[icon];
  const Heading = `h${headingLevel}`;
  return (
    <div className={`stateMessage stateMessage--${tone}`} role={tone === "error" ? "alert" : undefined}>
      <Icon className="stateIcon" aria-hidden="true" />
      <Heading className="stateTitle">{title}</Heading>
      {children && <p className="stateText">{children}</p>}
      {actions && <div className="stateActions">{actions}</div>}
    </div>
  );
}

export function ErrorState({ title = "We couldn't load stays", onRetry, children }) {
  return (
    <StateMessage
      icon="error"
      tone="error"
      title={title}
      actions={
        onRetry && (
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Retry
          </button>
        )
      }
    >
      {children ?? (
        <>
          Check that the data server is running (<code>npm run server</code>) and try again.
        </>
      )}
    </StateMessage>
  );
}

export function CardSkeleton({ variant = "grid" }) {
  return (
    <div className={`hotelCard hotelCard--${variant} skeletonCard`} aria-hidden="true">
      <div className="skeleton skeletonMedia" />
      <div className="hotelCardBody">
        <div className="skeleton skeletonLine" style={{ width: "80%" }} />
        <div className="skeleton skeletonLine" style={{ width: "55%" }} />
        <div className="skeleton skeletonLine" style={{ width: "35%" }} />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, label = "Loading stays…", variant, className = "cardGrid" }) {
  return (
    <div role="status">
      <span className="visuallyHidden">{label}</span>
      <div className={className}>
        {Array.from({ length: count }, (_, index) => (
          <CardSkeleton key={index} variant={variant} />
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" className="detail">
      <span className="visuallyHidden">Loading stay…</span>
      <div className="skeleton skeletonHero" aria-hidden="true" />
      <div className="detailBody" aria-hidden="true">
        <div className="detailMain">
          <div className="skeleton skeletonLine skeletonLine--lg" style={{ width: "70%" }} />
          <div className="skeleton skeletonLine" style={{ width: "40%" }} />
          <div className="skeleton skeletonLine" style={{ width: "90%" }} />
          <div className="skeleton skeletonLine" style={{ width: "85%" }} />
        </div>
        <div className="skeleton skeletonPriceCard" />
      </div>
    </div>
  );
}
