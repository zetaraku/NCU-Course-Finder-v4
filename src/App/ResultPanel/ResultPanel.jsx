import React from 'react';
import Pagination from './Pagination';
import ResultTable from './ResultTable';

export default function ResultPanel({ instance }) {
	return (
		<div className="ResultPanel">
			<Pagination instance={instance} />
			<ResultTable instance={instance} />
			<Pagination instance={instance} />
		</div>
	);
}
