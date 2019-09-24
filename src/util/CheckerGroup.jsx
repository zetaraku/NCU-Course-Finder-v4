import React from 'react';

export default function CheckerGroup({ type, name, options, inline = false, onChange = null }) {
	return (
		<>
			{options.map((e, i) => {
				if (e === null) {
					return inline ? (
						<div key={null} className="col-auto">
							｜
						</div>
					) : null;
				} else {
					let { key, label, checked } = e;

					let inputBox = (
						<div key={key} className={`custom-control custom-${type}`}>
							<input type={type}
								className="custom-control-input"
								id={`${type}-${name}-${i}`}
								name={name}
								value={key}
								checked={checked}
								onChange={onChange}
							/>
							<label
								className="custom-control-label"
								htmlFor={`${type}-${name}-${i}`}
							>
								{label}
							</label>
						</div>
					);

					return inline ? (
						<div key={key} className="col-auto">
							{inputBox}
						</div>
					) : inputBox;
				}
			})}
		</>
	);
}
