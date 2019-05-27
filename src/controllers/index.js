function calculation(activity, reach, visitors, N) {
    let averageSub = 0, averageUnsub = 0, averageReach = 0;
    let emptyStats = [];
    
    for(let i = 0; i < activity.length; i++){
        if (activity[i] === 0 ) {
            emptyStats.push(i)
        } else {
            averageSub += Math.ceil(activity[i].subscribed);
            averageUnsub += Math.ceil(activity[i].unsubscribed);
            averageReach += Math.ceil(reach[i].reach_subscribers);
        }
    }

    let realLength = activity.length - emptyStats.length;

    averageSub = averageSub / realLength;
    averageUnsub = averageUnsub / realLength;
    averageReach = averageReach / realLength;
    
    let S = Math.ceil(averageReach);
    let q = averageSub / N;       
    let b = averageUnsub / N;

    return {S, q, b}
}

function forMark (activity, reach, N) {
    let R = N;
    let markLength = activity.length;

    let markS = [];
    let markR = [];

    for (let i = 0; i < markLength; i++) {
        markS.push(Math.ceil(reach[i].reach_subscribers - activity[i].subscribed - activity[i].unsubscribed));            
        R = (R - Math.ceil(activity[i].subscribed - activity[i].unsubscribed + reach[i].reach_subscribers - markS[i]));
        markR.push(R);
    }
    return { markS, markR }
}

export function transformation(statistics, N) {
    try {
        let activity = [];
        let reach = [];
        let visitors = [];

        let data = statistics.reverse();  
            for (var i = 0; i < data.length; i++) {
                if (data[i].activity.likes > 0) { 
                    activity.push(data[i].activity)
                    reach.push(data[i].reach)
                    visitors.push(data[i].visitors)
                }
            }
        const transformedStat = {activity, reach, visitors};
        const calculatedData = calculation(activity, reach, visitors, N);
        const dataForMark = forMark(activity, reach, N);

        return { calculatedData, dataForMark, transformedStat }
     } catch (e) {
         console.log(e, 'error');
     }
}