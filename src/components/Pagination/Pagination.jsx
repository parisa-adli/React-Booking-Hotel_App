import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

// 1 … 4 5 6 … 11
function pageItems(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pages - 1) items.push("…");
  items.push(pages);
  return items;
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pageBtn pageBtn--step"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <HiChevronLeft aria-hidden="true" />
        <span>Prev</span>
      </button>
      <ol className="pageList">
        {pageItems(page, pages).map((item, index) =>
          item === "…" ? (
            <li key={`gap-${index}`} className="pageGap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="pageBtn"
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ol>
      <p className="pageStatus">
        Page {page} of {pages}
      </p>
      <button
        type="button"
        className="pageBtn pageBtn--step"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
      >
        <span>Next</span>
        <HiChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;
