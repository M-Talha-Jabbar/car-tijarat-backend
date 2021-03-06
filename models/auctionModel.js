const connectDB = require("../connect.js").connectToDB;
class Auction {
    constructor(auction) {
        if (auction) {
            this.start_date_time = auction.start_date_time
            this.end_date_time = auction.end_date_time
            this.sellerID = auction.sellerID
            this.startingPrice=auction.startingPrice;
            this.closing_bid = auction.closing_bid || null      //optional Buy now
            this.status = auction.status
            this.auc_winner = auction.auc_winner || null    //Will be set later      
            this.auc_vehicle = auction.auc_vehicle
            this.buyNow=auction.buyNow;
        }

    }
    async getall(search) {
        let query=null;
        if(search)
        query = `SELECT v.*,f.ID as featured, a.id, a.status, a.start_date_time, a.end_date_time, a.startingPrice FROM auctions as a JOIN vehicles as v ON(a.auc_vehicle=v.RegNo) LEFT JOIN featured_ads AS f ON (f.AuctionID=a.ID) WHERE v.name LIKE "%${search}%" OR v.description LIKE "%${search}%" ORDER BY f.PackageID DESC, a.start_date_time DESC;`;
        else
        query = `SELECT v.*,f.ID as featured, a.id, a.status, a.start_date_time, a.end_date_time, a.startingPrice FROM auctions as a JOIN vehicles as v ON(a.auc_vehicle=v.RegNo) LEFT JOIN featured_ads AS f ON (f.AuctionID=a.ID) WHERE 1 ORDER BY f.PackageID DESC,a.start_date_time DESC;`;
        
        console.log(query);
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            console.log(res.length)
            if (res.length > 0)
                return res;
            else
                return "No auctions found";

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }

    }
    async sellerAuctions(id){
        const query = `SELECT v.*, a.id, a.status, a.start_date_time, a.end_date_time, a.startingPrice FROM auctions as a JOIN vehicles as v ON(a.auc_vehicle=v.RegNo) WHERE a.sellerID=${id};`;
        
        console.log(query);
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            console.log(res.length)
            if (res.length > 0)
                return res;
            else
                return "No auctions found";

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }

    }
    async filters(fields, values) {
        let query = "Select * from `auctions` Where " + `${fields[0]}='${values[0]}'`;
        let index = 1;
        for (let index = 1; index < fields.length; index++)
            query += ` and ${fields[index]}='${values[index]}'`
        console.log(query);
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            console.log(res.length)
            if (res.length > 0)
                return res;
            else
                return "No auctions found";

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }


    }
    async insert() {
        if (!await this.validateVehicle(this.sellerID, this.auc_vehicle))  //Invalid Car
            throw Error("The selected vehicle is not registered against your cnic");
        if (!await this.validateAucTime(this.start_date_time, this.end_date_time))  //Invalid date
            throw Error("The selected vehicle already registered for auction in that dateTime");

        const query = "INSERT INTO `auctions`( `start_date_time`, `end_date_time`, `sellerID`,`startingPrice`,`closing_bid`,`status`,`auc_winner` ,`auc_vehicle`,`buyNow`)" + `VALUES ('${this.start_date_time}','${this.end_date_time}',${this.sellerID},${this.startingPrice},${this.closing_bid},'${this.status}',${this.auc_winner},'${this.auc_vehicle}',${this.buyNow})`;
        console.log(query)
        var dbCon, ExeQuery;
        try {
            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            return res;
        } catch (err) {
            return err;
        } finally {
            dbCon.release();
        }

    }  //end Insert

    async DeleteAuction(id) {
        const query = `Delete from auctions where Id=${id}`;
        let ExeQuery, dbCon;
        try {
            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            } catch (err) {
                console.log("cant Connect");
            }

            const res = await ExeQuery(query);
            console.log(res.affectedRows)
            return res;
        } catch (err) {
            throw err.message;
        }
        finally {
            dbCon.release();
        }

    }
    async validateVehicle(owner, vehicle) {
        const query = `Select * from vehicles where RegNo='${vehicle}' and ownerCNIC=(select UserCNIC from sellers where id=${owner})`
        console.log(query)
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;         //release
                ExeQuery = connection.ExeQuery;    
            }
            catch (err) {
                console.log("not connected :", err.message)
            }
            const res = await ExeQuery(query);
            console.log(res.length)
            if (res.length > 0)
                return true;
            else
                return false;

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }

    }
    async IsRegisteredForBidding(aucId,CNIC){
        const query = `SELECT * FROM bidders WHERE AuctionID=${aucId} and UserCnic="${CNIC}"`;
        console.log(query)
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            console.log(res.length)
            if (res.length > 0)
                return res;
            else
                return false;

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }
    }

    async registerForBidding(UserCNIC,AuctionID,RegID){
        const query=`UPDATE membership_registrations SET RemainingAuction=(SELECT RemainingAuction FROM membership_registrations WHERE RegID=${RegID})-1 WHERE RegID=${RegID};`
        const query2=`INSERT INTO bidders(UserCNIC, AuctionID) VALUES ('${UserCNIC}',${AuctionID})`;
        const query3=`SELECT ID as BiddingID FROM bidders WHERE UserCNIC='${UserCNIC}' and AuctionID=${AuctionID}`
        console.log(query3);
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            let res = await ExeQuery(query);
            console.log(res.affectedRows)  //Subscription  updated
            if (res.affectedRows > 0)
                {
                    res=await ExeQuery(query2);
                    if(res.affectedRows>0){
                        res=await ExeQuery(query3); //get bidding id
                        return res[0];
                    }
                }
            else
                return false;

        }
         catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }
    }

    async validateAucTime(start, end) {
        const query = `Select * from auctions where auc_vehicle='${this.auc_vehicle}' AND (start_date_time BETWEEN'${start}' and '${end}' OR end_date_time BETWEEN'${start}' and '${end}')`
        console.log(query)
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            console.log(res.length)
            if (res.length > 0)
                return false;
            else
                return true;

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }

    }
    async updateStatus(status,auctionId){
        const query = `UPDATE auctions SET status="${status}"WHERE ID IN (${[...auctionId]});`
        console.log(query)
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            console.log(res.affectedRows)
            if (res.affectedRows === 0)
                return false;
            else
                return true ;

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }

    }
    async getWinner(){
        const query = `SELECT a.Id,a.auc_vehicle as car,b.full_name,b.email,a.closing_bid as amt,b.contact_no FROM auctions as a JOIN (SELECT * FROM bidders as b JOIN users as u ON(b.UserCNIC=u.CNIC))as b ON(a.ID=b.AuctionID) WHERE a.auc_winner=b.ID and a.status="undefined";`
        console.log(query)
        var dbCon, ExeQuery;
        try {

            try {
                const connection = await connectDB();
                dbCon = connection.con;
                ExeQuery = connection.ExeQuery;
            }
            catch (err) {
                console.log("not connected :", err)
            }
            const res = await ExeQuery(query);
            console.log(res.length)
            if (res.length === 0)
                return false;
            else
                return res ;

        } catch (err) {
            console.log(err);
        }
        finally {
            dbCon.release();
        }

    }
}
module.exports = Auction;