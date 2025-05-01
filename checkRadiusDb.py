import os
import mysql.connector

# RADIUS database configuration - update as needed
RADIUS_DB = {
    "host": os.environ.get("RADIUS_DB_HOST", "localhost"),
    "user": os.environ.get("RADIUS_DB_USER", "radius"),
    "password": os.environ.get("RADIUS_DB_PASSWORD", "radiuspassword"),
    "database": os.environ.get("RADIUS_DB_NAME", "radius")
}

# SQL statements to create necessary tables
CREATE_TABLES = [
    """
    CREATE TABLE IF NOT EXISTS radcheck (
        id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL DEFAULT '',
        attribute VARCHAR(64) NOT NULL DEFAULT '',
        op CHAR(2) NOT NULL DEFAULT '==',
        value VARCHAR(253) NOT NULL DEFAULT '',
        PRIMARY KEY (id),
        KEY username (username(32))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS radreply (
        id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL DEFAULT '',
        attribute VARCHAR(64) NOT NULL DEFAULT '',
        op CHAR(2) NOT NULL DEFAULT '=',
        value VARCHAR(253) NOT NULL DEFAULT '',
        PRIMARY KEY (id),
        KEY username (username(32))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS radgroupcheck (
        id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        groupname VARCHAR(64) NOT NULL DEFAULT '',
        attribute VARCHAR(64) NOT NULL DEFAULT '',
        op CHAR(2) NOT NULL DEFAULT '==',
        value VARCHAR(253) NOT NULL DEFAULT '',
        PRIMARY KEY (id),
        KEY groupname (groupname(32))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS radgroupreply (
        id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        groupname VARCHAR(64) NOT NULL DEFAULT '',
        attribute VARCHAR(64) NOT NULL DEFAULT '',
        op CHAR(2) NOT NULL DEFAULT '=',
        value VARCHAR(253) NOT NULL DEFAULT '',
        PRIMARY KEY (id),
        KEY groupname (groupname(32))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS radusergroup (
        id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL DEFAULT '',
        groupname VARCHAR(64) NOT NULL DEFAULT '',
        priority INT(11) NOT NULL DEFAULT 1,
        PRIMARY KEY (id),
        KEY username (username(32))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS radacct (
        radacctid BIGINT(21) NOT NULL AUTO_INCREMENT,
        acctsessionid VARCHAR(64) NOT NULL DEFAULT '',
        acctuniqueid VARCHAR(32) NOT NULL DEFAULT '',
        username VARCHAR(64) NOT NULL DEFAULT '',
        groupname VARCHAR(64) NOT NULL DEFAULT '',
        realm VARCHAR(64) DEFAULT '',
        nasipaddress VARCHAR(15) NOT NULL DEFAULT '',
        nasportid VARCHAR(32) DEFAULT NULL,
        nasporttype VARCHAR(32) DEFAULT NULL,
        acctstarttime DATETIME DEFAULT NULL,
        acctupdatetime DATETIME DEFAULT NULL,
        acctstoptime DATETIME DEFAULT NULL,
        acctinterval INT(12) DEFAULT NULL,
        acctsessiontime INT(12) UNSIGNED DEFAULT NULL,
        acctauthentic VARCHAR(32) DEFAULT NULL,
        connectinfo_start VARCHAR(50) DEFAULT NULL,
        connectinfo_stop VARCHAR(50) DEFAULT NULL,
        acctinputoctets BIGINT(20) DEFAULT NULL,
        acctoutputoctets BIGINT(20) DEFAULT NULL,
        calledstationid VARCHAR(50) NOT NULL DEFAULT '',
        callingstationid VARCHAR(50) NOT NULL DEFAULT '',
        acctterminatecause VARCHAR(32) NOT NULL DEFAULT '',
        servicetype VARCHAR(32) DEFAULT NULL,
        framedprotocol VARCHAR(32) DEFAULT NULL,
        framedipaddress VARCHAR(15) NOT NULL DEFAULT '',
        PRIMARY KEY (radacctid),
        UNIQUE KEY acctuniqueid (acctuniqueid),
        KEY username (username),
        KEY framedipaddress (framedipaddress),
        KEY acctsessionid (acctsessionid),
        KEY acctsessiontime (acctsessiontime),
        KEY acctstarttime (acctstarttime),
        KEY acctinterval (acctinterval),
        KEY acctstoptime (acctstoptime),
        KEY nasipaddress (nasipaddress)
    );
    """
]

def check_and_create_tables():
    """Check if required tables exist and create them if they don't"""
    try:
        # Connect to the RADIUS database
        conn = mysql.connector.connect(
            host=RADIUS_DB["host"],
            user=RADIUS_DB["user"],
            password=RADIUS_DB["password"],
            database=RADIUS_DB["database"]
        )
        
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SHOW TABLES")
        existing_tables = [table[0].lower() for table in cursor.fetchall()]
        
        print(f"Existing tables: {existing_tables}")
        
        # Create missing tables
        for create_sql in CREATE_TABLES:
            cursor.execute(create_sql)
            conn.commit()
            
        print("All required tables have been checked and created if needed.")
        
        # Verify tables again
        cursor.execute("SHOW TABLES")
        updated_tables = [table[0].lower() for table in cursor.fetchall()]
        print(f"Updated tables list: {updated_tables}")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    except Exception as e:
        print(f"Error: {e}")
