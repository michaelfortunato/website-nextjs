import React, { useRef } from "react";
import styled from "@emotion/styled";
import Letter from "./Letter";
import Grid from "@mui/material/Grid";

const StyledName = styled(Grid)`
    font-size: 56px;
    overflow: visible;
    display: flex;
    justify-content: center;
    position: relative;
    text-align: center;
    color: #264653;
    padding-top: 2%;
    margin-bottom: 0px;
}

`;
const StyledFirstName = styled(Grid)`
	display: inline-block;
	margin-right: 10px;
`;
const StyledLastName = styled(Grid)`
	display: inline-block;
	margin-left: 10px;
`;
function buildConfigs(name: string) {
	let configsList = [];
	let config = {};
	let letters = name.split("");
	configsList = letters.map((char, index) => {
		config = configSetup(char, index);
		return config;
	});
	return configsList;
}
function configSetup(char: string, index: number) {
	return {
		char: char,
		XOffsetEnter: randomArcPoint(38).x, //((index % 2) == 0) ? 25 : -25;
		YOffsetEnter: randomArcPoint(38).y, // ((index % 2) == 0) ? -75 : 75;
		enterDuration: 500,
		enterDelay: 500
	};
}
function uniformRandom(min: number, max: number) {
	return Math.random() * (max - min) + min;
}
function randomArcPoint(radius: number) {
	let theta = 2 * Math.random() * Math.PI;
	return { x: radius * Math.cos(theta), y: radius * Math.cos(theta) };
}

export default function Name(props: any) {
	const firstNameConfigs = useRef(buildConfigs(props.firstName));
	const lastNameConfigs = useRef(buildConfigs(props.lastName));
	return (
		<StyledName container justifyContent="center">
			<StyledFirstName item>
				{props.firstName.split("").map((_: any, index: number) => (
					<Letter
						key={index}
						// setIsNameDone={props.setNameEntered}
						// triggerNameEnter={props.triggerNameEnter}
						{...firstNameConfigs.current[index]}
					/>
				))}
			</StyledFirstName>
			<StyledLastName item>
				{props.lastName.split("").map((_: any, index: number) => (
					<Letter
						key={index + 7}
						// setIsNameDone={props.setNameEntered}
						//triggerNameEnter={props.triggerNameEnter}
						{...lastNameConfigs.current[index]}
					/>
				))}
			</StyledLastName>
		</StyledName>
	);
}
