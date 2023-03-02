const database = include('databaseConnection');

async function createTODO(postData) {
    let createTODOSQL = `
		INSERT INTO userTODO
		(description, user_id)
		VALUES(:description, :userKey);
	`;

    let params = {
        description: postData.descript,
        userKey: postData.primary
    }

    try {
        const results = await database.query(createTODOSQL, params);

        console.log("Successfully created user");
        console.log(results[0]);
        return true;
    } catch (err) {
        console.log("Error inserting user");
        console.log(err);
        return false;
    }
}

async function getTODOS(postData) {
    let getTODOSQL = `
		SELECT description, user_id
		FROM userTODO
        WHERE user_id = :pk;
	`;

    let params = { pk: postData.primary}

    try {
        const results = await database.query(getTODOSQL, params);
        console.log(results + "\n")

        console.log("Successfully retrieved TODOS");
        console.log(results[0]);
        return results[0];
    } catch (err) {
        console.log("Error getting TODOS");
        console.log(err);
        return false;
    }
}

module.exports = { createTODO, getTODOS };