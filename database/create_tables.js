const database = include('databaseConnection');

async function createTables() {
    let createUserType = `
        CREATE TABLE IF NOT EXISTS user_type (
            user_type_id int NOT NULL AUTO_INCREMENT,
            type varchar(25) NOT NULL,
            PRIMARY KEY (user_type_id),
            UNIQUE KEY unique_type (type));
    `;

    try {
        const results = await database.query(createUserType);
        
        console.log("Successfully created tables");
        console.log(results[0]);
    } catch (err) {
        console.log("Error Creating tables");
        console.log(err);
        return false;
    }
    
    let createUserSQL = `
		CREATE TABLE IF NOT EXISTS user (
            user_id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(25) NOT NULL,
			email VARCHAR(100) NOT NULL,
            password VARCHAR(100) NOT NULL,
            PRIMARY KEY (user_id),
            UNIQUE INDEX unique_username (username ASC) VISIBLE,
            user_type_id INT NOT NULL DEFAULT 1,
            INDEX user_user_type_id_idx (user_type_id ASC) VISIBLE,
            FOREIGN KEY (user_type_id) REFERENCES user_type(user_type_id));
	`;

    try {
        const results = await database.query(createUserSQL);

        console.log("Successfully created tables");
        console.log(results[0]);
    } catch (err) {
        console.log("Error Creating tables");
        console.log(err);
        return false;
    }

    let createTODOSQL = `
        CREATE TABLE IF NOT EXISTS userTODO (
            userTODO_id INT NOT NULL AUTO_INCREMENT,
            description VARCHAR(100) NOT NULL,
            user_id INT NOT NULL,
            PRIMARY KEY (userTODO_id),
            FOREIGN KEY (user_id) REFERENCES user(user_id));
    `
    try {
        const results = await database.query(createTODOSQL);

        console.log("Successfully created tables");
        console.log(results[0]);
        return true;
    } catch (err) {
        console.log("Error Creating tables");
        console.log(err);
        return false;
    }
}

module.exports = { createTables };