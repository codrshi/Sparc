function countSetBits(num) {
    let count = 0;
    while (num > 0) {
        num &= (num - 1);
        count++;
    }
    return count;
}

export default countSetBits;