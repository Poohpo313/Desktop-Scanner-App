export function SearchTipsPanel() {
  return (
    <aside className="search-tips">
      <h2 className="search-tips__title">Search Tips</h2>
      <p className="search-tips__desc">
        Use quotes for exact phrases, use minus to exclude words, and use filters to narrow results.
      </p>
      <table className="search-tips__table">
        <tbody>
          <tr>
            <th scope="row">Example</th>
            <td>
              <code>&quot;Invoice number&quot;</code>
            </td>
          </tr>
          <tr>
            <th scope="row">Exclude</th>
            <td>
              <code>invoice -draft</code>
            </td>
          </tr>
          <tr>
            <th scope="row">Wildcard</th>
            <td>
              <code>receipt*</code>
            </td>
          </tr>
        </tbody>
      </table>
    </aside>
  );
}
