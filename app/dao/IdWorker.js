var IdWorker = module.exports = function(){
    this.workerId = Math.ceil(Math.random()*IdWorker.maxWorkerId);
    this.datacenterId = Math.ceil(Math.random()*IdWorker.maxDatacenterId);
    this.sequence = 0;
    this.lastTimestamp = -1;
    thi.idepoch = 1344322705519;
    
    if(this.workerId > IdWorker.maxWorkerId || input_workerId < 0){
        return;
    }
    this.workerId = input_workerId;

    this.nextId = function(){
        var timestamp = this.timeGen();
        if(this.lastTimestamp == timestamp){
            this.sequence = (this.sequence + 1) & this.sequenceMask;
            if(this.sequence == 0){
                timestamp = this.tilNextMillis(this.lastTimestamp);
            }
        }else{
            this.sequence = 0;
        }

        if(timestamp < this.lastTimestamp){
            //if(cal){
            //    cal("Clock moved backwards. Refusing to generate id for " + this.lastTimestamp - timestamp + " milliseconds", null);
            //}
            return -1;
            
        }

        this.lastTimestamp = timestamp;
        var nextId = ((timestamp - IdWorker.twepoch << IdWorker.timestampLeftShift))
| (this.workerId << this.workerIdShift) | (this.sequence);

        return nextId;
    };

    this.tilNextMillis = function(lastTimestamp){
        var timestamp = this.timeGen();
        while(timestamp <= IdWorker.lastTimestamp){
            timestamp = this.timeGen();
        }

        return timestamp;
    }

    this.timeGen = function(){
        return  (new Date()).valueOf();
    }
};

IdWorker.workerIdBits  = 4;
IdWorker.datacenterIdBits = 5;
IdWorker.maxWorkerId  = -1 ^ -1 << IdWorker.workerIdBits;
IdWorker.maxDatacenterId = -1 ^ (-1 << IdWorker.datacenterIdBits);
IdWorker.sequenceBits  = 4;
IdWorker.workerIdShift  = IdWorker.sequenceBits;
IdWorker.timestampLeftShift  = IdWorker.sequenceBits + IdWorker.workerIdBits;
IdWorker.sequenceMask  = -1 ^ -1 << IdWorker.sequenceBits;
IdWorker.sequenceBits  = 4;
IdWorker.twepoch = 1288834974657;

