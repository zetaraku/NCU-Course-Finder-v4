import $ from 'jquery';
import React from 'react';
import 'bootstrap';

import moment from 'moment';
import 'moment/locale/zh-tw';

import InfoModal from './InfoModal';
import SearchPanel from './SearchPanel';
import ResultPanelWrapper from 'util/ResultPanelWrapper';
import { remote_data_host } from 'res/_settings';

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			courses: [],
			lastUpdate: null,
			departmentTree: null,
			popupInfo: null,
			announcement: null,
		};

		this.instance = null;
	}

	componentDidMount() {
		this.init();
	}

	instanceCallback = (instance) => {
		// this is used to get the instance from the child component
		this.instance = instance;
	};

	onSearched = (filters) => {
		if (this.instance !== null) {
			this.instance.setAllFilters(filters);
		}
		$([document.documentElement, document.body]).animate({
			scrollTop: $('.ResultPanel').offset().top
		}, 500);
	};

	render() {
		return (
			<div className="App">
				{
					this.state.popupInfo !== null &&
					<InfoModal
						title="※※免責聲明※※"
						innerHTML={this.state.popupInfo}
						okMessage="好，我知道了"
					/>
				}
				<SearchPanel
					title="NCU Course Finder 4.0"
					announcement={this.state.announcement}
					departmentTree={this.state.departmentTree}
					lastUpdate={this.state.lastUpdate}
					onSearched={this.onSearched}
				/>
				<ResultPanelWrapper
					courses={this.state.courses}
					instanceCallback={this.instanceCallback}
				/>
			</div>
		);
	}

	init() {
		fetch(`${remote_data_host}/info/popup_info.html?ts=${moment().valueOf()}`)
			.then(res => res.text())
			.then(result => {
				this.setState({ popupInfo: result });
			});

		fetch(`${remote_data_host}/info/announcement.html?ts=${moment().valueOf()}`)
			.then(res => res.text())
			.then(result => {
				this.setState({ announcement: result });
			});

		Promise.all([
			fetch(`${remote_data_host}/dynamic/courses.json?ts=${moment().valueOf()}`),
			fetch(`${remote_data_host}/dynamic/department_tree.json?ts=${moment().valueOf()}`),
		]).then(async ([courses_response, department_tree_response]) => {
			let { courses, LAST_UPDATE_TIME } = await courses_response.json();
			let { department_tree } = await department_tree_response.json();

			Object.values(courses).forEach(course => {
				try {
					course.deptname = department_tree[course.colecode].departments[course.deptcode].name;
				} catch (e) {
					course.deptname = 'N/A';
				}

				if (course.limitCnt === 0) {
					course.limitCnt = Infinity;
				}
				course.remainCnt = course.limitCnt - course.admitCnt;
				course.successRate = getRate(course.remainCnt, course.waitCnt);
				course.fullRate = getRate(course.admitCnt, course.limitCnt);
			});

			this.setState({
				departmentTree: department_tree,
				courses: Object.values(courses),
				lastUpdate: moment.unix(LAST_UPDATE_TIME),
			});
		});

		function getRate(n, d) {
			return Math.floor(1000 * n / d) / 10;
		}
	}
}
