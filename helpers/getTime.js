const getToday = () => {
	return new Date();
};

const getDate = date => {
	return new Date(date);
};

exports.getNextDay = () => {
	let now = getToday();
	let nextDay = new Date(now.setDate(now.getDate() + 1));
	return nextDay;
};

exports.getYesterDay = () => {
	let now = getToday();
	let nextDay = new Date(now.setDate(now.getDate() - 1));
	return nextDay;
};

exports.getWeek = () => {
	let now = getToday();
	let weekAgo = new Date(now.setDate(now.getDate() - 7));
	return weekAgo;
};

exports.getMonth = () => {
	let now = getToday();
	let monthAgo = new Date(now.setDate(now.getDate() - 30));
	return monthAgo;
};