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
			colleges: null,
			departments: null,
			popupInfo: null,
			schedule: {
				status: '加退選',
				from: moment('0000-01-01'),
				to: moment('0000-01-01'),
				start: moment('0000-01-01'),
			},
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
				{/* <a href="https://ncucf-v5.herokuapp.com/" target="_blank" rel="noopener noreferrer">
					<div style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'gold',
						height: '50px',
					}}>
						試用最新版本！－ NCU Course Finder 5.0 (beta)
					</div>
				</a> */}
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
					colleges={this.state.colleges}
					departments={this.state.departments}
					schedule={this.state.schedule}
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
		fetch(`${remote_data_host}/static/popup_info.html?ts=${moment().valueOf()}`)
			.then(res => res.ok ? res.text() : Promise.reject(`${res.status} ${res.statusText}`))
			.then(result => {
				this.setState({ popupInfo: result });
			}).catch(error => {
				this.setState({ popupInfo: `
					<span style="color: red;">
						<strong>錯誤：無法取得內容，請聯絡管理員</strong>
					</span>
				` });
				console.error(error);
			});

		fetch(`${remote_data_host}/dynamic/schedule.json?ts=${moment().valueOf()}`)
			.then(res => res.ok ? res.json() : Promise.reject(`${res.status} ${res.statusText}`))
			.then(result => {
				let { status, from, to, start } = result;
				this.setState({
					schedule: {
						status,
						from: moment(from),
						to: moment(to),
						start: moment(start),
					},
				});
			}).catch(error => {
				console.error(error);
			});

		fetch(`${remote_data_host}/dynamic/all.json?ts=${moment().valueOf()}`)
			.then(async (response) => {
				if (!response.ok)
					throw Error('course data or department cannot be fetched.');

				let { colleges, departments, courses, LAST_UPDATE_TIME } = await response.json();

				courses.forEach(course => {
					// insert collegeId
					course.collegeIds = course.departmentIds
						.map(d => departments.find(department => department.departmentId === d).collegeId);

					// calculate other counts
					course.limitCnt = course.limitCnt !== null ? course.limitCnt : Infinity;
					course.remainCnt = course.limitCnt - course.admitCnt;
					course.successRate = getRate(course.remainCnt, course.waitCnt + 1);
					course.fullRate = getRate(course.admitCnt, course.limitCnt);
				});

				this.setState({
					colleges,
					departments,
					courses,
					lastUpdate: moment(LAST_UPDATE_TIME),
				});
			}).catch(error => {
				console.error(error);
			});

		function getRate(n, d) {
			return Math.floor(1000 * n / d) / 10;
		}
	}
}
