function setDayToOne(date) {
    const creationDate = new Date(date.getFullYear(), date.getMonth(), 2);
    return new Date(creationDate).toISOString().split('T')[0];
}

export default setDayToOne;