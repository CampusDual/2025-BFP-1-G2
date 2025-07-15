package com.campusdual.bfp.model.dto;

public class MonthlyClosedOffersDTO {
    private int month;
    private int year;
    private long count;

    public MonthlyClosedOffersDTO(int month, int year, long count) {
        this.month = month;
        this.year = year;
        this.count = count;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
