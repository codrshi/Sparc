export function transactionComparator(transaction1, transaction2) {
    return Math.abs(transaction1.amount) === Math.abs(transaction2.amount) &&
        transaction1.type === transaction2.type &&
        transaction1.paymentMethod === transaction2.paymentMethod &&
        transaction1.date === transaction2.date &&
        transaction1.description === transaction2.description;
}