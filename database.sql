CREATE DATABASE IF NOT EXISTS Agora;

use Agora;

CREATE TABLE Users (
  UserID int not null primary key auto_increment,
  Username varchar(40),
	Email varchar(254),
	Surname varchar(50),
	Forename varchar(50),
  PreferredName varchar(50)
);

CREATE TABLE GroupTypes (
	GroupTypeID int not null primary key auto_increment,
	Name varchar(50)
);

CREATE TABLE Groups (
	GroupID int not null primary key auto_increment,
	Name varchar(50),
    GroupTypeID int not null,
	FOREIGN KEY (GroupTypeID) REFERENCES GroupTypes(GroupTypeID)
);

CREATE TABLE LinkGroupsUsers (
	LinkID int not null primary key auto_increment,
	GroupID int not null,
    UserID int not null,
	FOREIGN KEY (GroupID) REFERENCES Groups(GroupTypeID),
	FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Parties (
	PartyID int not null primary key auto_increment,
	Name varchar(100),
	PathToLogo varchar(256)
);

CREATE TABLE Candidates (
	CandidateID int not null primary key auto_increment,
	Name varchar(100),
    PartyID int not null,
	FOREIGN KEY (PartyID) REFERENCES Parties(PartyID)
);

CREATE TABLE Systems (
	SystemID int not null primary key auto_increment,
	Name varchar(50)
);

CREATE TABLE Elections (
	ElectionID int not null primary key auto_increment,
  Name varchar(50)
);

CREATE TABLE Votes (
	VoteID int not null primary key auto_increment,
    UserID int not null,
    ElectionID int not null,
    SystemID int not null,
    CandidateID int not null,
	FOREIGN KEY (UserID) REFERENCES Users(UserID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID),
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	Score int
);

CREATE TABLE LinkCandidatesElections (
	LinkID int not null primary key auto_increment,
	CandidateID int not null,
    ElectionID int not null,
    PartyID int not null,
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (PartyID) REFERENCES Parties(PartyID)
);

CREATE TABLE LinkElectionsSystems (
	LinkID int not null primary key auto_increment,
    ElectionID int not null,
    SystemID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID)
);

CREATE TABLE LinkElectionsCandidates (
	LinkID int not null primary key auto_increment,
	ElectionID int not null,
	CandidateID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID)
);

CREATE TABLE LinkElectionsGroups (
	LinkID int not null primary key auto_increment,
	ElectionID int not null,
	GroupID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (GroupID) REFERENCES Groups(GroupTypeID)
);
