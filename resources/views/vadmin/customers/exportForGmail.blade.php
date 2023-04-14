@extends('vadmin.partials.invoice-excel')

@section('content')
<table class="table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Given Name</th>
            <th>Additional Name</th>
            <th>Family Name</th>
            <th>Yomi Name</th>
            <th>Given Name Yomi</th>
            <th>Additional Name Yomi</th>
            <th>Family Name Yomi</th>
            <th>Name Prefix</th>
            <th>Name Suffix</th>
            <th>Initials</th>
            <th>Nickname</th>
            <th>Short Name</th>
            <th>Maiden Name</th>
            <th>Birthday</th>
            <th>Gender</th>
            <th>Location</th>
            <th>Billing Information</th>
            <th>Directory Server</th>
            <th>Mileage	Occupation</th>
            <th>Hobby</th>
            <th>Sensitivity	Priority</th>
            <th>Subject	Notes</th>
            <th>Language</th>
            <th>Photo</th>
            <th>Group Membership</th>
            <th>E-mail 1 - Type</th>
            <th>E-mail 1 - Value</th>
            <th>E-mail 2 - Type</th>
            <th>E-mail 2 - Value</th>
            <th>Phone 1 - Type</th>
            <th>Phone 1 - Value</th>
        </tr>
    </thead>
    <tbody>
    @foreach($items as $item)
    <tr>
        {{-- Name - GivenName - Additional Name - FamilyName --}}
        <td>{{ $item->name }} {{ $item->surname }}</td>
        <td>{{ $item->name }}</td>
        <td></td>
        <td>{{ $item->surname }}</td>
        {{-- Yomi Name - Given Name Yomi - Additional Name Yomi - Family Name Yomi --}}
        <td></td> <td></td> <td></td> <td></td>
        
        {{-- Prefix - Sufix - Initials --}}
        <td></td> <td></td> <td></td>

        <td>{{ $item->usermane }}</td>

        {{-- Shortname - MaidenName - Birthday - Gender --}}
        <td></td> <td></td> <td></td> <td></td>

        <td>{{ $item->geoprov['name'] }} - {{ $item->geoloc['name'] }}</td>
        <td>{{ $item->cp }}</td>
        {{-- Directory Server - Mileage	- Occupation - Hobby - Sensitivity - Priority -	Subject - Notes - Language - Photo --}}
        <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> 
        <td>* myContacts</td>
        {{-- EMails  ---}}
        <td></td>
        <td>{{ $item->email }}</td>
        <td>*</td>
        <td></td>
        {{-- Phone --}}
        <td></td>
        <td>{{ $item->phone }}</td>
    </tr>
    @endforeach			
    </tbody>
</table>
@endsection