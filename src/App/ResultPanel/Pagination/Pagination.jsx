import React from 'react';

const pageSizeOptions = [25, 50, 100, 250, 500];

export default function Pagination({ instance }) {
	const {
		rows,
		pageCount,
		gotoPage,
		previousPage,
		nextPage,
		canPreviousPage,
		canNextPage,
		setPageSize,
		state: [{ pageIndex, pageSize }],
	} = instance;

	return (
		<div className="Pagination">
			<div className="pager-block">
				<button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
					<span className="rwd-span" data-text-large="第一頁" data-text-small="<<"></span>
				</button>

				&nbsp;

				<button onClick={() => previousPage()} disabled={!canPreviousPage}>
					<span className="rwd-span" data-text-large="上一頁" data-text-small="<"></span>
				</button>

				&nbsp;

				<span>
					共找到
					<strong> {rows.length} </strong>
					筆結果，
				</span>
				<span>
					本頁為第
					<strong> {pageIndex + 1} / {pageCount} </strong>
					頁
				</span>

				&nbsp;

				<button onClick={() => nextPage()} disabled={!canNextPage}>
					<span className="rwd-span" data-text-large="下一頁" data-text-small=">"></span>
				</button>

				&nbsp;

				<button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
					<span className="rwd-span" data-text-large="最末頁" data-text-small=">>"></span>
				</button>
			</div>

			&nbsp;

			<div className="pager-block">
				每頁顯示
				&nbsp;
				<select
					value={pageSize}
					onChange={e => setPageSize(Number(e.target.value))}
				>
					{pageSizeOptions.map(pageSize => (
						<option key={pageSize} value={pageSize}>{pageSize}</option>
					))}
				</select>
				&nbsp;
				筆
			</div>
		</div>
	);
}
