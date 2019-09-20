import React from 'react';
import CheckerGroup from 'util/CheckerGroup';

export const DAY_IDS = ['0', '1', '2', '3', '4', '5', '6'];
export const HOUR_IDS = ['1', '2', '3', '4', 'Z', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D'];
const weekday_name = ['日', '一', '二', '三', '四', '五', '六'];

export default class SchedulePanel extends React.Component {
	render() {
		return (
			<div className="SchedulePanel">
				<div className="ScheduleOption">
					過濾方法：
					<CheckerGroup type="radio"
						name="schedule_mode"
						options={
							[
								['', <>全部 (不過濾)</>],
								['include', <>包含<strong>選取時段</strong>的項目</>],
								['enclose', <>限定<strong>選取時段</strong>的項目</>],
								['exclude', <>排除<strong>選取時段</strong>的項目</>],
							].map(e => ({
								key: e[0], label: e[1],
								checked: this.props.periodsOpt === e[0]
							}))
						}
						inline={false}
						onChange={this.props.onPeriodsOptionChanged}
					/>
				</div>
				<table className="ScheduleTable"
					style={{ display: this.props.periodsOpt !== '' ? 'block' : 'none' }}
				>
					<colgroup>
						<col className="head" />
						<col className="weekend" />
						<col className="weekday" span={5} />
						<col className="weekend" />
					</colgroup>
					<thead>
						<tr>
							<th>＼</th>
							{DAY_IDS.map(day =>
								<th key={day}>
									<button className="btn btn-warning" onClick={() => this.props.toggleDay(day)}>
										{weekday_name[day]}
									</button>
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{HOUR_IDS.map(ej => {
							let periodType = (
								ej === 'Z'
									? 'noon'
									: ['A', 'B', 'C', 'D'].includes(ej)
										? 'night'
										: ''
							);
							return (
								<tr key={ej} className={periodType}>
									<th>
										<button className="btn btn-warning" onClick={() => this.props.toggleHour(ej)}>{ej}</button>
									</th>
									{DAY_IDS.map(ei => {
										return (
											<td key={`${ei}-${ej}`}>
												<div className="custom-control custom-control-lg custom-checkbox">
													<input type="checkbox"
														className="custom-control-input"
														id={`checkbox-time-${ei}-${ej}`}
														value={`${ei}-${ej}`}
														checked={this.props.periods.has(`${ei}-${ej}`)}
														onChange={this.props.onPeriodsChanged}
													/>
													<label
														className="custom-control-label"
														htmlFor={`checkbox-time-${ei}-${ej}`}
													></label>
												</div>
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr>
							<td colSpan={8}>※點擊星期或時段可一次切換整排</td>
						</tr>
					</tfoot>
				</table>
			</div>
		);
	}
}
