export function upsertObject<T extends { id: string }>(arr: T[], newObj: T): T[] {
    const index = arr.findIndex(obj => obj.id === newObj.id);

    if (index !== -1) {
        // Object exists, update it
        arr[index] = newObj;
    } else {
        // Object doesn't exist, insert at the beginning
        arr.unshift(newObj);
    }

    return arr;
}