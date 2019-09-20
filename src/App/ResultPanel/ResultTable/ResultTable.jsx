import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ResultTable({ instance }) {
	const {
		page,
		prepareRow,
		getTableProps,
		headerGroups,
	} = instance;

	return (
		<table {...getTableProps()} className="ResultTable">
			<thead>
				{headerGroups.map((headerGroup, i) => (
					<tr key={i} {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map((column, j) => (
							<th key={j} {...column.getHeaderProps(column.getSortByToggleProps())}>
								{column.render('Header')}
								{!column.disableSorting &&
									<>
										&nbsp;
										{column.isSorted
											? column.isSortedDesc
												? <FontAwesomeIcon icon="sort-down" />
												: <FontAwesomeIcon icon="sort-up" />
											: <FontAwesomeIcon icon="sort" />
										}
									</>
								}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{page.map((row, i) =>
					prepareRow(row) || (
						<tr key={i} {...row.getRowProps()} className="CourseRow">
							{row.cells.map((cell, j) => (
								<td key={j} {...cell.getCellProps()}>
									{cell.render('Cell')}
								</td>
							))}
						</tr>
					)
				)}
			</tbody>
		</table>
	);
}
