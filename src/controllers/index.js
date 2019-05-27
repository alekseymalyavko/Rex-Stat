export function check(data) {
    try {
       console.log(data)
    } catch (e) {
        console.log(e, 'error');
    }
};

function calculation(activity, reach, visitors) {
    let length = activity.length;
    let averageSub = 0, averageUnsub = 0, averageReach = 0;

    let emptyStats = [];
    
    for(let i = 0; i < length; i++){
        if (activity[i].activity == 0 ) {
            emptyStats.push(i)
        } else {
            averageSub += Math.ceil(activity[i].activity.subscribed);
            averageUnsub += Math.ceil(activity[i].activity.unsubscribed);
            averageReach += Math.ceil(reach[i].reach.reach_subscribers);
        }
    }

    let realLength = length - emptyStats.length;

    averageSub = averageSub / realLength;
    averageUnsub = averageUnsub / realLength;
    averageReach = averageReach / realLength;
    
    S = Math.ceil(averageReach);
    q = averageSub / N;       
    b = averageUnsub / N;
}
export function transformation(statistics) {
    try {
        let activity = [];
        let reach = [];
        let visitors = [];

        let data = statistics;  
            for (var i = 0; i < statistics.length; i++) {
                if (data[i].activity.likes > 0) { 
                    activity.push({
                        activity: data[i].activity
                    })
                    reach.push({
                        reach: data[i].reach
                    })
                    visitors.push({
                        visitors: data[i].reach
                    })
                }
            }       
        calculation(activity, reach, visitors)
     } catch (e) {
         console.log(e, 'error');
     }
}